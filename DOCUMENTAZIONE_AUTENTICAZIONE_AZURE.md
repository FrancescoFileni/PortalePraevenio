# BlazorPortal – Autenticazione lato Azure (Sintesi Operativa)

## 1. Obiettivo

Questo documento riassume **come è configurata e come funziona** l’autenticazione di BlazorPortal lato Azure / Entra ID, in relazione a quanto implementato nel codice del progetto.

È pensato per chi deve:
- Mantenere la configurazione esistente su Azure.
- Replicare l’integrazione in un nuovo ambiente (dev / test / prod).

---

## 2. Componenti Azure coinvolti

A livello Azure, la soluzione usa:

1. **Tenant Azure AD / Entra ID**  
   Dove risiedono gli utenti aziendali che accedono a BlazorPortal.

2. **App registration (SPA) per BlazorPortal**  
   - Tipo: *Single-page application (SPA)*.
   - Espone un `ClientId` che viene configurato nel progetto (`AzureAd:ClientId`).

3. **Ambiente Dataverse (Dynamics 365 / Power Platform)**  
   - URL di base configurato come `DataverseWebApi:ResourceUrl` (ad es. `https://org.crm4.dynamics.com`).
   - Espone lo scope delegato `user_impersonation` per le chiamate al Web API.

Questi elementi sono collegati tramite:
- Sezione `AzureAd` in appsettings (letta in `Program.cs`).
- Scope `{resourceUrl}/user_impersonation` usato da MSAL per richiedere token verso Dataverse.

---

## 3. Collegamento con il codice (Program.cs)

Nel file `BlazorPortal/BlazorPortal/Program.cs` troviamo:

```csharp
builder.Services.AddMsalAuthentication(options =>
{
    builder.Configuration.Bind("AzureAd", options.ProviderOptions.Authentication);

    options.ProviderOptions.LoginMode = "redirect";
    options.ProviderOptions.Cache.CacheLocation = "localStorage";

    options.ProviderOptions.DefaultAccessTokenScopes
        .Add($"{resourceUrl}/user_impersonation");
});
```

Significato lato Azure:

- `builder.Configuration.Bind("AzureAd", ...)`  
  Usa i dati di configurazione dell’app registrata su Entra ID (Authority, ClientId, ecc.).

- `LoginMode = "redirect"`  
  L’utente viene reindirizzato alla pagina di login di Azure AD per autenticarsi.

- `CacheLocation = "localStorage"`  
  I token emessi da Azure AD (id token, access token) vengono salvati nel *localStorage* del browser.

- `DefaultAccessTokenScopes.Add($"{resourceUrl}/user_impersonation")`  
  Quando il codice chiede un access token a `IAccessTokenProvider`, chiede lo scope Dataverse `user_impersonation`.

---

## 4. Configurazione della App Registration (SPA)

Nel portale Azure → Entra ID → **App registrations**:

1. **Registrazione nuova app**
   - Tipo: *Single-page application (SPA)*.
   - Nome a piacere (es. "BlazorPortal").

2. **Platform configuration (SPA)**
   - Aggiungere gli URL di redirect dell’app Blazor, ad esempio:
     - Ambiente sviluppo:
       - `https://localhost:xxxx/authentication/login-callback`
     - Ambiente produzione:
       - `https://portal.miodominio.it/authentication/login-callback`

3. **Valori da usare nel progetto**
   - `ClientId` dell’app → `AzureAd:ClientId`.
   - `TenantId` o Authority (`https://login.microsoftonline.com/<tenant-id>/`) → `AzureAd:Authority`.

Esempio di sezione `AzureAd` (schema tipico):

```json
"AzureAd": {
  "Authority": "https://login.microsoftonline.com/<tenant-id>/",
  "ClientId": "<client-id-spa>",
  "ValidateAuthority": true
}
```

Questa sezione viene letta automaticamente dal codice tramite `Bind("AzureAd", ...)`.

---

## 5. Permessi API verso Dataverse

Sempre nella App Registration SPA, sezione **API permissions**:

1. Aggiungere permesso verso **Dynamics CRM / Dataverse**:
   - API: *Dynamics CRM* (o *Microsoft Dataverse* a seconda della label nel portale).
   - Tipo di permesso: **Delegated**.
   - Permesso: **user_impersonation**.

2. Dare **Admin consent** a questo permesso:
   - In modo che qualsiasi utente del tenant possa ottenere un access token per Dataverse tramite questa app.

Questo è coerente con:
- Lo scope `{resourceUrl}/user_impersonation` configurato in `Program.cs`.

Quando Blazor chiede un access token con quello scope, Azure AD controlla che la SPA registrata abbia il permesso `user_impersonation` su Dataverse.

---

## 6. Flusso di autenticazione (Authorization Code + PKCE)

Dal punto di vista Azure AD / MSAL, il flusso standard è:

1. L’utente clicca su **Log in** nell’app.
2. L’app naviga a `/authentication/login` (gestito da `RemoteAuthenticatorView`).
3. MSAL avvia il redirect verso Azure AD (`/oauth2/v2.0/authorize`) con:
   - `client_id` = ClientId della SPA.
   - `redirect_uri` = `/authentication/login-callback`.
   - `scope` = `openid profile offline_access {resourceUrl}/user_impersonation`.
   - Parametri PKCE (`code_challenge`, ecc.).
4. L’utente si autentica (e passa eventuale MFA/policy di accesso condizionale).
5. Azure AD reindirizza il browser a `/authentication/login-callback` con un `code`.
6. MSAL, dal browser, scambia il `code` con i token (authorization code flow con PKCE):
   - `id_token` → identità utente (claims come `name`, `preferred_username`).
   - `access_token` → per Dataverse (`{resourceUrl}/user_impersonation`).
7. MSAL salva i token in localStorage (perché configurato così in `Program.cs`).

Da questo momento:

- Blazor costruisce l’`AuthenticationState` dai claims del `id_token`.
- Le pagine usano `AuthenticationStateProvider` per leggere nome ed email utente.
- Il codice usa `IAccessTokenProvider` per ottenere (o rinnovare) l’`access_token` verso Dataverse.

---

## 7. Verifica del token da parte di Dataverse

Quando una pagina chiama Dataverse:

1. Chiede un access token con `IAccessTokenProvider` (scope `{resourceUrl}/user_impersonation`).
2. Aggiunge l’header `Authorization: Bearer <access_token>` alla richiesta HTTP verso l’URL Dataverse (configurato in `Program.cs`).

Sul lato Dataverse:

- Il token viene validato da Azure AD (firma, scadenza, audience `aud = resourceUrl`).
- Viene verificato che lo scope includa `user_impersonation`.
- Dataverse esegue l’operazione **a nome dell’utente** (delegated permission) e applica:
  - Security roles.
  - Privilegi configurati sull’utente Dataverse corrispondente.

In pratica:
- Anche se il frontend è Blazor, l’autorizzazione sui dati è governata dalle regole e dai ruoli configurati in Dataverse.

---

## 8. Uso dei claims Azure nell’app (name, preferred_username)

I token emessi da Azure AD contengono vari claims, fra cui:

- `name` → nome completo visualizzato.
- `preferred_username` → in genere l’email o UPN dell’utente.

Nel codice Blazor:

- `context.User.Identity?.Name` → usato in `LoginDisplay.razor` per mostrare "C
iao, {Nome}".
- `preferred_username` → usato nelle pagine e in `PermessiService` per:
  - Ottenere la mail utente (`userEmail`).
  - Associare l’utente ad un cliente/azienda.
  - Leggere i permessi applicativi da Dataverse (entità `new_emailautorizzazioniprvs`).

Questo collega direttamente l’**identità Azure** all’**identità applicativa** e alle autorizzazioni sui dati.

---

## 9. Checklist per replicare l’integrazione in un nuovo ambiente

1. **In Azure / Entra ID**
   - Creare (o clonare) una App Registration di tipo SPA.
   - Configurare i redirect URI per l’ambiente (es. dev, test, prod).
   - Annotare `ClientId` e `TenantId`/Authority.
   - Aggiungere permesso API → Dynamics/Dataverse → Delegated → `user_impersonation`.
   - Dare Admin consent.

2. **In Dataverse**
   - Verificare che gli utenti AAD siano collegati agli utenti Dataverse.
   - Configurare security roles adeguati (cosa può vedere/fare ciascun utente).

3. **Nel progetto BlazorPortal**
   - Impostare sezione `AzureAd` in appsettings con ClientId e Authority dell’app SPA.
   - Impostare `DataverseWebApi:ResourceUrl` e `Version` per l’ambiente.
   - Lasciare intatta la configurazione `AddMsalAuthentication` in `Program.cs`.

Una volta completati questi passi, il flusso di autenticazione e l’accesso a Dataverse funzionano come nell’ambiente originale.
