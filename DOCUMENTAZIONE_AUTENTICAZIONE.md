# BlazorPortal – Documentazione Dettagliata del Sistema di Autenticazione e Autorizzazione

## 1. Obiettivo del documento

Questo documento descrive **in dettaglio** come è stato implementato il sistema di autenticazione e autorizzazione in BlazorPortal.

Vengono coperti:

- Configurazione di MSAL / Azure AD in `Program.cs`.
- Composizione dell’app con `CascadingAuthenticationState`, `AuthorizeRouteView` e gestione globale di `NotAuthorized` in `App.razor`.
- Flussi di login/logout/callback tramite `RemoteAuthenticatorView` in `Authentication.razor`.
- Widget di login/logout (UI) in `LoginDisplay.razor`.
- Componente di redirect a login `RedirectToLogin.razor`.
- Uso di `AuthorizeView` nelle pagine.
- Uso di `AuthenticationStateProvider` e `IAccessTokenProvider` in tutte le pagine che leggono informazioni sull’utente o chiamano Dataverse.
- Sistema di permessi applicativi (`PermessiUtente`, `IPermessiService`, `PermessiService`) e dove viene usato.


## 2. Configurazione MSAL / Azure AD (Program.cs)

**File:** `BlazorPortal/BlazorPortal/Program.cs`

L’autenticazione è configurata tramite **MSAL** con il metodo di estensione `AddMsalAuthentication`.

### 2.1 Registrazione di AddMsalAuthentication

Nel corpo di `Program.cs` troviamo:

```csharp
builder.Services.AddMsalAuthentication(options =>
{
    builder.Configuration.Bind("AzureAd", options.ProviderOptions.Authentication);

    // usa il redirect invece del popup (necessario per il caching in localStorage)
    options.ProviderOptions.LoginMode = "redirect";

    // memorizza i token in localStorage anziché in memory
    options.ProviderOptions.Cache.CacheLocation = "localStorage";

    options.ProviderOptions.DefaultAccessTokenScopes
        .Add($"{resourceUrl}/user_impersonation");
});
```

Significato dei punti principali:

- **Binding configurazione**
  - `builder.Configuration.Bind("AzureAd", options.ProviderOptions.Authentication);`
  - Lega la sezione di configurazione `AzureAd` (presente in appsettings) alle opzioni di autenticazione di MSAL.
  - Tipicamente contiene:
    - `ClientId`
    - `Authority` / `TenantId`
    - `ValidateAuthority` e impostazioni collegate.

- **LoginMode = "redirect"**
  - L’autenticazione avviene tramite **redirect di pagina intera** verso il login di Azure AD, non con un popup.
  - È la modalità consigliata in molti scenari, e necessaria per usare `localStorage` come cache di token.

- **CacheLocation = "localStorage"**
  - I token (ID token e access token) sono conservati nel `localStorage` del browser.
  - Vantaggi:
    - Persistenza anche dopo refresh e riapertura della scheda.
  - Svantaggi potenziali:
    - I token sono accessibili da JavaScript nella stessa origin, quindi è importante prevenire XSS.

- **DefaultAccessTokenScopes**
  - `options.ProviderOptions.DefaultAccessTokenScopes.Add($"{resourceUrl}/user_impersonation");`
  - Definisce lo scope predefinito che verrà richiesto quando si usano i metodi di `IAccessTokenProvider`.
  - `resourceUrl` punta a Dataverse, quindi lo scope è l’API Dataverse `user_impersonation`.

### 2.2 Effetto complessivo

- Gli utenti si autenticano contro Azure AD/Entra ID.
- MSAL gestisce internamente:
  - Scambio di token.
  - Rinnovo silente ove possibile.
  - Caching in `localStorage`.
- L’app Blazor può poi usare:
  - `AuthenticationStateProvider` per leggere identità e claims.
  - `IAccessTokenProvider` per richiedere token di accesso verso Dataverse.


## 3. Composizione dell’app e routing protetto (App.razor)

**File:** `BlazorPortal/BlazorPortal/App.razor`

### 3.1 CascadingAuthenticationState

Il contenuto principale è avvolto da:

```razor
<CascadingAuthenticationState>
    ...
</CascadingAuthenticationState>
```

- Questo componente fornisce un **cascading parameter** (`Task<AuthenticationState>`) a tutti i discendenti.
- È la base per l’uso di `AuthorizeView`, `AuthorizeRouteView` e il servizio `AuthenticationStateProvider`.

### 3.2 Router, AuthorizeRouteView e NotAuthorized globale

All’interno troviamo:

- `ErrorBoundary` per la gestione globale delle eccezioni.
- `Router AppAssembly="@typeof(App).Assembly"`.
- `AuthorizeRouteView` come RouteView principale:

  ```razor
  <Router AppAssembly="@typeof(App).Assembly">
      <Found Context="routeData">
          <AuthorizeRouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)">
              <NotAuthorized>
                  @if (context.User.Identity?.IsAuthenticated != true)
                  {
                      <RedirectToLogin />
                  }
                  else
                  {
                      <p role="alert">You are not authorized to access this resource.</p>
                  }
              </NotAuthorized>
          </AuthorizeRouteView>
          <FocusOnNavigate RouteData="@routeData" Selector="h1" />
      </Found>
      ...
  </Router>
  ```

Significato:

- Per ogni route trovata (`Found`):
  - L’oggetto `routeData` viene passato a `AuthorizeRouteView`.
  - Se la pagina ha `[Authorize]`, la view verifica le condizioni di autenticazione/autorizzazione.
- Blocco `NotAuthorized`:
  - Se l’utente **non è autenticato** → render di `<RedirectToLogin />`.
  - Se è autenticato ma **non ha i permessi (in termini di policy/ruoli)** → messaggio generico "You are not authorized to access this resource.".

In caso di route non trovata (`NotFound`), viene usato `LayoutView` con `MainLayout`.

### 3.3 FocusOnNavigate

- `FocusOnNavigate` viene usato per spostare il focus sull’`h1` della nuova pagina, migliorando l’accessibilità.


## 4. Flusso di autenticazione con RemoteAuthenticatorView (Authentication.razor)

**File:** `BlazorPortal/BlazorPortal/Pages/Authentication.razor`

Contenuto chiave:

```razor
@page "/authentication/{action}"
@using Microsoft.AspNetCore.Components.WebAssembly.Authentication
<RemoteAuthenticatorView Action="@Action" />

@code{
    [Parameter] public string? Action { get; set; }
}
```

### 4.1 Route e azioni

- La route `/authentication/{action}` consente diverse azioni a seconda del segmento `action`:
  - `/authentication/login`
  - `/authentication/login-callback`
  - `/authentication/logout`
  - `/authentication/logout-callback`
  - Eventuali altre azioni supportate dalla pipeline MSAL.

- `Action` è un parametro di route passato a `RemoteAuthenticatorView`.

### 4.2 RemoteAuthenticatorView

- È il componente fornito da `Microsoft.AspNetCore.Components.WebAssembly.Authentication` che incapsula la logica di:
  - Avvio del login (redirect verso Azure AD).
  - Gestione del callback dopo l’autenticazione.
  - Logout.
  - Gestione degli errori di autenticazione.

Flusso tipico di login:

1. L’utente clicca sul link di login (vedi `LoginDisplay.razor`).
2. Il browser naviga a `/authentication/login`.
3. `RemoteAuthenticatorView` con `Action="login"` avvia il redirect verso Azure AD.
4. Dopo credenziali corrette, Azure AD redirecta verso `/authentication/login-callback`.
5. `RemoteAuthenticatorView` completa il processo, salva i token via MSAL e aggiorna lo stato di autenticazione.

Flusso di logout:

1. L’utente clicca sul bottone di logout.
2. `NavigateToLogout("authentication/logout")` invia il browser alla route corrispondente.
3. `RemoteAuthenticatorView` con `Action="logout"` gestisce la chiusura della sessione MSAL, pulendo i token.
4. Il provider di identità può anche eseguire logout single sign-out se configurato.


## 5. Widget di login/logout (LoginDisplay.razor)

**File:** `BlazorPortal/BlazorPortal/Layout/LoginDisplay.razor`

Struttura principale:

```razor
@using Microsoft.AspNetCore.Components.WebAssembly.Authentication
@inject NavigationManager Navigation

<AuthorizeView>
    <Authorized>
        <div class="user-display">
            <span class="hello-text">Ciao, @context.User.Identity?.Name!</span>
            <button class="logout-btn" @onclick="BeginLogOut">Log out</button>
        </div>
    </Authorized>

    <NotAuthorized>
        <div class="user-display">
            <a class="login-btn" href="authentication/login">Log in</a>
        </div>
    </NotAuthorized>
</AuthorizeView>

@code {
    public void BeginLogOut()
    {
        Navigation.NavigateToLogout("authentication/logout");
    }
}
```

### 5.1 Parte Authorized

- Mostra:
  - Un saluto con `context.User.Identity?.Name` (nome utente dai claims del token).
  - Un pulsante "Log out".
- `BeginLogOut` esegue `Navigation.NavigateToLogout("authentication/logout")`:
  - Metodo di estensione fornito dal pacchetto di autenticazione Blazor WASM.
  - Avvia il flusso di logout (vedi sezione precedente su RemoteAuthenticatorView).

### 5.2 Parte NotAuthorized

- Mostra un link "Log in" che punta direttamente a `/authentication/login`.
- Cliccando, si raggiunge la pagina `Authentication.razor` con `Action="login"`.


## 6. Redirect automatico al login (RedirectToLogin.razor)

**File:** `BlazorPortal/BlazorPortal/Layout/RedirectToLogin.razor`

Contenuto:

```razor
@using Microsoft.AspNetCore.Components.WebAssembly.Authentication
@inject NavigationManager Navigation

@code {
    protected override void OnInitialized()
    {
        Navigation.NavigateToLogin("authentication/login");
    }
}
```

Uso:

- Viene utilizzato nel blocco `NotAuthorized` di `App.razor` quando `context.User.Identity?.IsAuthenticated != true`.
- Effetto:
  - Se un utente non autenticato tenta di accedere a una route protetta, l’app lo reindirizza in automatico al flusso di login.


## 7. Uso di AuthorizeView nelle pagine

Molte pagine usano `AuthorizeView` per gestire la parte di contenuto visibile solo agli utenti autenticati.

Esempi di file che contengono `AuthorizeView`:

- `Pages/Dashboard.razor`
- `Pages/ElencoConsegneDpi.razor`
- `Pages/ElencoDocumenti.razor`
- `Pages/ElencoControlliMacchinariEImpianti.razor`
- `Pages/ElencoDpiASistema.razor`
- `Pages/ElencoDocumentiSede.razor`
- `Pages/ElencoMacchinariEImpianti.razor`
- `Pages/ElencoLavoratori.razor`
- `Pages/ElencoVersioniFile.razor`
- `Pages/FetchSedi.razor`
- `Pages/VisiteMediche.razor`
- `Pages/ElencoPartecipazioni.razor`
- `Pages/ElencoFile.razor`
- `Pages/ElencoControlliDpi.razor`
- `Pages/FetchAccounts.razor`
- `Layout/LoginDisplay.razor`

Pattern tipico:

```razor
<AuthorizeView>
    <Authorized>
        <!-- Contenuto protetto (toolbar, tabelle, ecc.) -->
    </Authorized>
    <NotAuthorized>
        <h3>Authentication Failure!</h3>
        <p>You're not signed in.</p>
    </NotAuthorized>
</AuthorizeView>
```

Note:

- Alcune pagine mostrano un semplice messaggio di errore in `NotAuthorized` (senza redirect esplicito).
- In combinazione con `App.razor` e `[Authorize]` sulle pagine, si ottiene sia protezione della route sia controllo sul contenuto.


## 8. Uso di AuthenticationStateProvider

`AuthenticationStateProvider` viene iniettato e usato in molte pagine e servizi per:

- Ottenere l’utente corrente.
- Leggere i claims (in particolare la mail dall’attributo `preferred_username`).

### 8.1 Iniezione tipica nelle pagine

Esempi (file `.razor`):

- `Pages/AddMacchinarioSede.razor`
- `Pages/AddPartecipazione.razor`
- `Pages/AddTestataConsegne.razor`
- `Pages/AddTestataDettaglioSede.razor`
- `Pages/AddTestataDocumentiSede.razor`
- `Pages/AddVisitaMedica.razor`
- `Pages/DettaglioControlloDpi.razor`
- `Pages/DettaglioFile.razor`
- `Pages/DettaglioMacchinario.razor`
- `Pages/DettaglioPartecipazione.razor`
- `Pages/ElencoDocumentiSede.razor`
- `Pages/ElencoPartecipazioni.razor`
- `Pages/FetchSedi.razor`
- `Pages/ElencoVersioniFile.razor`
- `Pages/VisiteMediche.razor`
- `Pages/ElencoMacchinariEImpianti.razor`
- `Pages/ElencoLavoratori.razor`
- `Pages/ElencoFile.razor`
- `Pages/ElencoDocumenti.razor`
- `Pages/ElencoControlliDpi.razor`
- `Pages/ElencoControlliMacchinariEImpianti.razor`
- `Pages/ElencoConsegneDpi.razor`
- `Pages/ElencoDpiASistema.razor`
- `Pages/DettaglioLavoratore.razor`
- `Pages/DettaglioVisita.razor`
- `Pages/DettaglioDpi.razor`
- `Pages/Dashboard.razor`
- `Pages/DettaglioSede.razor`
- `Pages/DettaglioControlliMacchinari.razor`
- `Pages/AddTestataDpiLavoratore.razor`
- `Pages/AddSedeALavoratore.razor`
- `Pages/AddTestataConsegneSede.razor`
- `Pages/AddMacchinario.razor`
- `Pages/AddTestataDocumenti.razor`
- `Pages/AddLavoratore.razor`
- `Pages/AddLavoratoreSede.razor`
- `Pages/AddConsegne.razor`

Pattern comune nel codice C# all’interno di queste pagine:

```csharp
var authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
var user = authState.User;

if (user.Identity.IsAuthenticated)
{
    userName = user.Identity.Name;
    userEmail = user.FindFirst(c => c.Type == "preferred_username")?.Value;
    // logging, uso di userEmail per filtrare i dati, ecc.
}
```

Uso di `userEmail`:

- Spesso passato a metodi come `CaricaClienteAssociato(userEmail)` che:
  - Compongono FetchXML per trovare l’azienda associata all’email.
  - Fanno dipendere i dati mostrati (documenti, lavoratori, macchinari, ecc.) dall’azienda dell’utente.

### 8.2 Uso in PermessiService

Nel servizio `PermessiService`, `AuthenticationStateProvider` viene iniettato per:

- Ottenere `authState = await _auth.GetAuthenticationStateAsync();`
- Recuperare il claim `preferred_username` da: `user.FindFirst(c => c.Type == "preferred_username")?.Value;`
- Utilizzare l’email per interrogare Dataverse (entità `new_emailautorizzazioniprvs`).


## 9. Uso di IAccessTokenProvider

`IAccessTokenProvider` è il servizio che dialoga con MSAL per ottenere un access token valido per gli scope configurati (in questo caso Dataverse `user_impersonation`).

### 9.1 Iniezione nelle pagine

Esempi di file `.razor` che iniettano `IAccessTokenProvider TokenProvider`:

- `Pages/AddLavoratoreSede.razor`
- `Pages/AddMacchinarioSede.razor`
- `Pages/AddPartecipazione.razor`
- `Pages/AddTestataConsegne.razor`
- `Pages/AddTestataDocumenti.razor`
- `Pages/AddTestataDpiLavoratore.razor`
- `Pages/Dashboard.razor`
- `Pages/DettaglioDpi.razor`
- `Pages/DettaglioMacchinario.razor`
- `Pages/DettaglioLavoratore.razor`
- `Pages/DettaglioPartecipazione.razor`
- `Pages/DettaglioFile.razor`
- `Pages/DettaglioTestataDocumenti.razor`
- `Pages/DettaglioSede.razor`
- `Pages/DettaglioTestataDocumentiSede.razor`
- `Pages/DettaglioTestataDpi.razor`
- `Pages/DettaglioVisita.razor`
- `Pages/ElencoConsegneDpi.razor`
- `Pages/DettaglioControlliMacchinari.razor`
- `Pages/DettaglioControlloDpi.razor`
- `Pages/ElencoControlliMacchinariEImpianti.razor`
- `Pages/ElencoDocumenti.razor`
- `Pages/ElencoControlliDpi.razor`
- `Pages/ElencoDocumentiSede.razor`
- `Pages/AggiornaFile.razor`
- `Pages/ElencoDpiASistema.razor`
- `Pages/AddVisitaMedica.razor`
- `Pages/AddTestataDocumentiSede.razor`
- `Pages/ElencoFile.razor`
- `Pages/AddTestataDettaglioSede.razor`
- `Pages/ElencoFileSede.razor`
- `Pages/AddSedeALavoratore.razor`
- `Pages/ElencoLavoratori.razor`
- `Pages/AddTestataConsegneSede.razor`
- `Pages/AddNuovaVersioneFile.razor`
- `Pages/ElencoMacchinariEImpianti.razor`
- `Pages/AddMansioneSede.razor`
- `Pages/ElencoVersioniFile.razor`
- `Pages/FetchAccounts.razor`
- `Pages/ElencoPartecipazioni.razor`
- `Pages/AddMacchinario.razor`
- `Pages/FetchSedi.razor`
- `Pages/VisiteMediche.razor`
- `Pages/AddFileSede.razor`
- `Pages/AddLavoratore.razor`
- `Pages/AddFile.razor`
- `Pages/AddConsegne.razor`
- `Pages/AddCartellaDocumentiSede.razor`
- `Pages/AddCartellaDocumenti.razor`

### 9.2 Pattern di utilizzo

Dentro tali pagine, il codice segue spesso questo schema:

```csharp
var tokenResult = await TokenProvider.RequestAccessToken();
if (tokenResult.TryGetToken(out var token))
{
    var client = ClientFactory.CreateClient("DataverseClient");

    var request = new HttpRequestMessage(HttpMethod.Get, url);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token.Value);

    var response = await client.SendAsync(request);
    // gestione della risposta JSON
}
else
{
    // gestione errore token mancante / non ottenibile
}
```

Combinato con `AuthenticationStateProvider`, questo permette di:

- Fare chiamate autenticate verso Dataverse.
- Limitare i dati in base all’utente corrente (usando la sua email/azienda).

### 9.3 Uso in PermessiService

Nel servizio `PermessiService`:

- `IAccessTokenProvider _tokenProvider` viene usato in `LoadAsync()` per ottenere l’access token necessario a interrogare l’entità dei permessi.
- Senza un token valido, il servizio registra un log error e restituisce permessi vuoti.


## 10. Sistema di permessi applicativi (PermessiUtente / PermessiService)

### 10.1 Modello PermessiUtente

**File:** `BlazorPortal/BlazorPortal/Models/PermessiUtente.cs`

Proprietà principali:

- `Guid? ClienteId`  
  Riferimento all’azienda cliente associata all’utente.

- Flag booleani:
  - `bool Sedi`
  - `bool Lavoratori`
  - `bool Dpi`
  - `bool Formazione`
  - `bool Cliente`
  - `bool ImpiantiMacchinari`

Questi flag mappano 1:1 campi booleani dell’entità Dataverse `new_emailautorizzazioniprvs` (es. `new_lavoratori`, `cr4f9_sede`, `cr4f9_dpi`, ...).

### 10.2 Interfaccia IPermessiService

**File:** `BlazorPortal/BlazorPortal/Services/IPermessiService.cs`

```csharp
public interface IPermessiService
{
    Task<PermessiUtente> GetPermessiAsync();
    void Invalidate();
}
```

### 10.3 Implementazione PermessiService

**File:** `BlazorPortal/BlazorPortal/Services/PermessiService.cs`

Dipendenze:

- `IAccessTokenProvider _tokenProvider`
- `IHttpClientFactory _clientFactory`
- `AuthenticationStateProvider _auth`
- `ILogger<PermessiService> _logger`

Campi interni:

- `PermessiUtente? _cache;` → cache in memoria dei permessi caricati.
- `Task<PermessiUtente>? _inflight;` → task in corso per evitare richieste multiple concorrenti.

#### Costruttore

```csharp
public PermessiService(
    IAccessTokenProvider tokenProvider,
    IHttpClientFactory clientFactory,
    AuthenticationStateProvider auth,
    ILogger<PermessiService> logger)
{
    _tokenProvider = tokenProvider;
    _clientFactory = clientFac