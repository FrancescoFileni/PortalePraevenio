# BlazorPortal – Documentazione di Panoramica

## 1. Contesto e obiettivi

BlazorPortal è un portale web sviluppato con **Blazor WebAssembly**, pensato per gestire processi e dati legati alla sicurezza sul lavoro e alla compliance, tra cui:

- DPI (Dispositivi di Protezione Individuale)
- Visite mediche dei lavoratori
- Macchinari e impianti
- Lavoratori e sedi
- Documenti, cartelle documentali e consegne
- Partecipazioni e formazione

L’applicazione è interamente client-side (Blazor WASM) e dialoga direttamente con **Microsoft Dataverse Web API** utilizzando token di accesso ottenuti tramite **Azure AD / MSAL**.


## 2. Struttura del progetto

Radice progetto: `BlazorPortal/BlazorPortal`

Componenti principali:

- **Program.cs**  
  File di bootstrap dell’applicazione Blazor WebAssembly.
- **App.razor**  
  Entry point UI, definisce Router, gestione dello stato di autenticazione, gestione globale degli errori.
- **Layout/**  
  Contiene i layout condivisi (MainLayout, NavMenu, LoginDisplay, RedirectToLogin, ecc.).
- **Pages/**  
  Contiene tutte le pagine funzionali (Razor components con `@page`).
- **Services/**  
  Contiene servizi applicativi, in particolare il servizio permessi (`IPermessiService`, `PermessiService`).
- **Models/**  
  Contiene i modelli dati condivisi, per ora principalmente `PermessiUtente`.
- **wwwroot/**  
  Contenuti statici, CSS, eventuali configurazioni client (appsettings).


## 3. Bootstrap dell’applicazione (Program.cs)

File: `BlazorPortal/BlazorPortal/Program.cs`

Responsabilità principali:

1. Creazione del `WebAssemblyHostBuilder` e registrazione dei componenti root:
   - `App` montato su `#app`.
   - `HeadOutlet` per gestire elementi `<head>` dinamici.

2. Lettura configurazione Dataverse:
   - Sezione `DataverseWebApi` (tipicamente da `wwwroot/appsettings*.json`):
     - `ResourceUrl`: URL base di Dataverse.
     - `Version`: versione API (es. `v9.2`).
     - `TimeoutSeconds`: timeout richieste HTTP.

3. Registrazione servizi condivisi:
   - `HttpClient` di base con `BaseAddress = builder.HostEnvironment.BaseAddress`.
   - **MudBlazor** via `AddMudServices()` per la UI.

4. Configurazione HttpClient nominato per Dataverse:
   - `AddHttpClient("DataverseClient", client => { ... })`.
   - `BaseAddress = {resourceUrl}/api/data/{version}/`.
   - Timeout e intestazioni `OData-Version`/`OData-MaxVersion`.

5. **Configurazione autenticazione MSAL** (vedi documento dedicato):
   - `AddMsalAuthentication` con binding su sezione `AzureAd`.
   - Configurazione di login redirect, cache in `localStorage` e scope `user_impersonation`.

6. Registrazione del servizio permessi applicativi:
   - `builder.Services.AddScoped<IPermessiService, PermessiService>();`

7. Avvio dell’applicazione con `await builder.Build().RunAsync();`.


## 4. Routing, layout e gestione globale (App.razor)

File: `BlazorPortal/BlazorPortal/App.razor`

Struttura di alto livello:

- `CascadingAuthenticationState`  
  Fornisce lo stato di autenticazione (`AuthenticationState`) a tutti i componenti figli.

- `ErrorBoundary`  
  Wrappa il `Router` e, in caso di eccezioni non gestite, mostra un componente di fallback: `BlazorPortal.Shared.ErrorFallback`.

- `Router AppAssembly="@typeof(App).Assembly"`  
  Smista le richieste in base all’URL verso le pagine in `Pages/`.

- `AuthorizeRouteView` come RouteView di default  
  Se la pagina è annotata con `[Authorize]`, il rendering passa dai controlli di sicurezza.

- Blocco `NotAuthorized` di `AuthorizeRouteView`:
  - Se l’utente **non è autenticato** (`context.User.Identity?.IsAuthenticated != true`), viene renderizzato `RedirectToLogin`.
  - Se l’utente è autenticato ma **non autorizzato**, viene mostrato un messaggio generico "You are not authorized to access this resource.".

- `FocusOnNavigate`  
  Gestisce il focus sulla navigazione (accessibilità), puntando all’`h1` principale.

- `NotFound`  
  Per route non trovate, mostra un semplice messaggio di "Sorry, there's nothing at this address." all’interno di `MainLayout`.


## 5. Layout e navigazione

Cartella: `BlazorPortal/BlazorPortal/Layout`

### 5.1 MainLayout

File: `MainLayout.razor`

- Layout principale dell’applicazione.
- Include:
  - Header / top bar (tipicamente con il titolo dell’applicazione, eventualmente login display).
  - Nav menu laterale (incluso tramite `NavMenu`).
  - Sezione principale di contenuto (`Body`).
- Stili associati: `MainLayout.razor.css`.

### 5.2 NavMenu

File: `NavMenu.razor`

- Implementa il menu laterale usando MudBlazor (`MudNavMenu`, `MudNavLink`).
- Inietta e utilizza `IPermessiService` per caricare `PermessiUtente`:
  - Voci di menu mostrate/nascoste in base ai flag:
    - Esempio: se `permessi.Dpi` è `true` → mostra sezione "DPI".
    - Se `permessi.Lavoratori` è `true` → mostra sezione "Lavoratori".
- Gestisce anche lo stato di caricamento (es. `loaded` booleano).
- Stili custom definiti in fondo al file (CSS inline nel componente).

### 5.3 LoginDisplay

File: `LoginDisplay.razor`

- Mostra informazioni utente e azioni di login/logout.
- Usa `AuthorizeView` per distinguere:
  - Utente autenticato → testo "Ciao, {Nome}" e bottone "Log out".
  - Utente non autenticato → link "Log in" verso la pagina di autenticazione.
- La logica di login/logout si basa sulle API di navigazione di MSAL (`NavigateToLogin`, `NavigateToLogout`).

### 5.4 RedirectToLogin

File: `RedirectToLogin.razor`

- Componente minimale che, in `OnInitialized`, chiama `Navigation.NavigateToLogin("authentication/login")`.
- Utilizzato in `App.razor` nel blocco `NotAuthorized` globale per forzare il redirect alla pagina di login.


## 6. Pagine principali (Pages/)

La cartella `BlazorPortal/BlazorPortal/Pages` contiene la logica funzionale dell’applicazione. Ogni file `.razor` rappresenta una pagina (o dialog) Blazor, spesso con struttura:

- `@page "/route"`
- `@using` per spazi dei nomi necessari (MudBlazor, Authentication, System.Net.Http, ecc.).
- `@inject` per servizi (HttpClient, IAccessTokenProvider, AuthenticationStateProvider, ILogger, DialogService, JSRuntime, ecc.).
- Marcup basato su componenti MudBlazor e HTML.
- Blocco `@code { ... }` con la logica C#.

Le principali macro-aree:

### 6.1 Dashboard

File: `Dashboard.razor`

- Route principale `/`.
- Usa `AuthorizeView` per mostrare contenuto solo ad utenti autenticati.
- Mostra tabelle riepilogative (es. controlli DPI e macchinari) con MudBlazor.
- Inietta `IAccessTokenProvider`, `IHttpClientFactory`, `AuthenticationStateProvider`, `ILogger<Dashboard>`.
- Esegue chiamate a Dataverse (via FetchXML o query HTTP) per popolare le tabelle.

### 6.2 Sedi e clienti

- `FetchSedi.razor`:
  - Permette la ricerca e visualizzazione sedi con filtri multipli.
  - Usa `AuthorizeView`, `AuthenticationStateProvider`, `IAccessTokenProvider`, `IHttpClientFactory`.
  - Costruisce dinamicamente una query FetchXML in base ai filtri e all’utente autenticato.

- `FetchAccounts.razor`:
  - Similmente, permette il fetch di account/aziende.

### 6.3 Lavoratori

- `ElencoLavoratori.razor`, `AddLavoratore.razor`, `AddLavoratoreSede.razor`, `DettaglioLavoratore.razor`, `AddSedeALavoratore.razor`, ecc.
- Pattern comune:
  - `AuthorizeView` per proteggere la pagina.
  - Uso di `AuthenticationStateProvider` per ricavare l’utente corrente.
  - Uso di `IAccessTokenProvider` e `IHttpClientFactory` per chiamare Dataverse.
  - Caricamento dinamico di dati (lista lavoratori, sedi associate, dettagli lavoratore, ecc.).

### 6.4 DPI e consegne

- `ElencoDpiASistema.razor`, `ElencoConsegneDpi.razor`, `DettaglioDpi.razor`, `DettaglioControlloDpi.razor`, `AddConsegne.razor`, `AddTestataDpiLavoratore.razor`, ecc.
- Gestione di:
  - Elenchi DPI disponibili a sistema.
  - Consegne DPI ai lavoratori.
  - Dettaglio di singoli DPI e controlli.
- Anche qui, pattern comune con `AuthorizeView`, `AuthenticationStateProvider` e `IAccessTokenProvider`.

### 6.5 Macchinari e impianti

- `ElencoMacchinariEImpianti.razor`, `ElencoControlliMacchinariEImpianti.razor`, `DettaglioMacchinario.razor`, `DettaglioControlliMacchinari.razor`, `AddMacchinario.razor`, `AddMacchinarioSede.razor`, `AddMansioneSede.razor`.
- Funzionalità:
  - Visualizzazione elenco macchinari/impianti.
  - Visualizzazione e gestione controlli di sicurezza.
  - Assegnazioni macchinari a sedi/mansioni.

### 6.6 Documenti e file

- `ElencoDocumenti.razor`, `ElencoDocumentiSede.razor`, `DettaglioTestataDocumenti.razor`, `DettaglioTestataDocumentiSede.razor`.
- `ElencoFile.razor`, `ElencoFileSede.razor`, `DettaglioFile.razor`.
- `AddFile.razor`, `AddFileSede.razor`, `AddCartellaDocumenti.razor`, `AddCartellaDocumentiSede.razor`, `AddNuovaVersioneFile.razor`, `AggiornaFile.razor`.
- Permettono la gestione completa del ciclo di vita dei documenti (cartelle, file, versioni).
- Fortemente integrati con Dataverse tramite FetchXML.

### 6.7 Visite mediche

- `VisiteMediche.razor`, `DettaglioVisita.razor`.
- Gestione delle visite mediche dei lavoratori, con filtri, dettagli e certificati.
- Autenticazione e permessi influenzano i dati accessibili (es. permessi sui lavoratori).

### 6.8 Partecipazioni e formazione

- `ElencoPartecipazioni.razor`, `AddPartecipazione.razor`, `DettaglioPartecipazione.razor`.
- Gestione delle partecipazioni a corsi/eventi di formazione.

### 6.9 Autenticazione

- `Authentication.razor`:
  - Route `/authentication/{action}`.
  - Contiene `RemoteAuthenticatorView` per orchestrare login, logout, callback.
  - Rientra nel sistema di autenticazione descritto nel documento dedicato.


## 7. Servizi applicativi e modelli

### 7.1 IPermessiService / PermessiService

Cartella: `BlazorPortal/BlazorPortal/Services`

- **IPermessiService**: interfaccia con:
  - `Task<PermessiUtente> GetPermessiAsync();`
  - `void Invalidate();`

- **PermessiService**: implementazione che:
  - Usa `AuthenticationStateProvider` per ottenere l’utente corrente.
  - Usa `IAccessTokenProvider` e `IHttpClientFactory` per leggere da Dataverse l’entità permessi `new_emailautorizzazioniprvs`.
  - Mappa i risultati nel modello `PermessiUtente`.
  - Mantiene una cache in memoria client per ridurre le chiamate.

### 7.2 PermessiUtente

Cartella: `BlazorPortal/BlazorPortal/Models`

- Modello C# che rappresenta i permessi funzionali associati all’utente autenticato:
  - `ClienteId`
  - Flag booleani: `Sedi`, `Lavoratori`, `Dpi`, `Formazione`, `Cliente`, `ImpiantiMacchinari`.
- Utilizzato da `NavMenu` e dalle pagine per abilitare o meno sezioni funzionali.


## 8. Integrazione con Dataverse (pattern generale)

In tutte le pagine che accedono ai dati, il pattern comune è:

1. Iniezione servizi:
   - `IAccessTokenProvider TokenProvider`
   - `IHttpClientFactory ClientFactory`
   - `AuthenticationStateProvider AuthenticationStateProvider`
   - `ILogger<T>`, `IDialogService`, `IJSRuntime`, `ISnackbar` secondo necessità.

2. In `OnInitializedAsync`:
   - Richiesta dello stato di autenticazione e lettura dei claims (nome, email, ecc.).
   - Chiamata a metodi di caricamento dati, spesso condizionati dall’azienda / email dell’utente.

3. Per le chiamate Dataverse:
   - `var tokenResult = await TokenProvider.RequestAccessToken();`
   - `tokenResult.TryGetToken(out var token)` → se ok, creare `client = ClientFactory.CreateClient("DataverseClient");`.
   - Costruire FetchXML come stringa (`BuildAziendaFetchXml`, `Build...FetchXml`, ecc.).
   - Creare `HttpRequestMessage` verso l’endpoint Dataverse con querystring `?fetchXml=...`.
   - Aggiungere header `Authorization: Bearer {token.Value}`.
   - Inviare richiesta e deserializzare JSON.


## 9. UX, librerie e stile

- **MudBlazor** è la libreria UI principale:
  - Tabelle (`MudTable`), bottoni (`MudButton`), alert (`MudAlert`), layout (`MudPaper`), icone, snackbar, dialog, ecc.
- Stili CSS personalizzati:
  - Ogni pagina include uno o più file CSS in `wwwroot/css/` tramite `<link href="css/xxx.css" ...>`.
  - Alcuni componenti layout contengono CSS inline nel file `.razor`.


## 10. Riepilogo

BlazorPortal è quindi un portale Blazor WebAssembly che:

- Usa Azure AD / MSAL per l’autenticazione degli utenti.
- Usa Dataverse come data store principale, accessibile direttamente dal client.
- Organizza la UI tramite layout condivisi, navigazione laterale e molte pagine verticali (DPI, lavoratori, macchinari, visite, documenti...).
- Implementa un sistema di permessi applicativi (`PermessiUtente` + `PermessiService`) per limitare l’accesso a diverse sezioni funzionali.

Per i dettagli completi sul sistema di autenticazione (configurazione MSAL, RemoteAuthenticatorView, uso di AuthenticationStateProvider, IAccessTokenProvider, AuthorizeView, PermessiService, ecc.) fare riferimento al file `DOCUMENTAZIONE_AUTENTICAZIONE.md` nella stessa cartella.
