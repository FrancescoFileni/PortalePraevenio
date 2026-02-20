using BlazorPortal.Models;
using Microsoft.AspNetCore.Components.WebAssembly.Authentication;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text.Json;

namespace BlazorPortal.Services
{
    public sealed class PermessiService : IPermessiService
    {
        private readonly IAccessTokenProvider _tokenProvider;
        private readonly IHttpClientFactory _clientFactory;
        private readonly AuthenticationStateProvider _auth;
        private readonly ILogger<PermessiService> _logger;

        private PermessiUtente? _cache;
        private Task<PermessiUtente>? _inflight;

        public PermessiService(
    IAccessTokenProvider tokenProvider,
    IHttpClientFactory clientFactory,
    AuthenticationStateProvider auth,
    ILogger<PermessiService> logger)
        {
            _tokenProvider = tokenProvider;
            _clientFactory = clientFactory;
            _auth = auth;
            _logger = logger;
        }
    

    public Task<PermessiUtente> GetPermessiAsync()
        {
            if (_cache != null) return Task.FromResult(_cache);
            if (_inflight != null) return _inflight;

            _inflight = LoadAsync();
            return _inflight;
        }

        public void Invalidate()
        {
            _cache = null;
            _inflight = null;
        }

        private async Task<PermessiUtente> LoadAsync()
        {
            var result = new PermessiUtente();

            // email utente
            var authState = await _auth.GetAuthenticationStateAsync();
            var user = authState.User;
            var email = user.FindFirst(c => c.Type == "preferred_username")?.Value;

            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogWarning("Email utente non trovata (preferred_username).");
                _cache = result;
                _inflight = null;
                return result;
            }

            // token
            var tokenResult = await _tokenProvider.RequestAccessToken();
            if (!tokenResult.TryGetToken(out var token))
            {
                _logger.LogError("Token non disponibile per leggere i permessi.");
                _cache = result;
                _inflight = null;
                return result;
            }

            var fetchXml = BuildFetchXml(email);

            var client = _clientFactory.CreateClient("DataverseClient");
            var req = new HttpRequestMessage(
                HttpMethod.Get,
                $"{client.BaseAddress}new_emailautorizzazioniprvs?fetchXml={Uri.EscapeDataString(fetchXml)}"
            );

            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token.Value);
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var resp = await client.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogError("Errore fetch permessi: {Status} {Reason}", resp.StatusCode, resp.ReasonPhrase);
                _cache = result;
                _inflight = null;
                return result;
            }

            var body = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);

            var value = doc.RootElement.GetProperty("value");
            if (value.GetArrayLength() == 0)
            {
                _logger.LogWarning("Nessun record permessi trovato per email {Email}", email);
                _cache = result;
                _inflight = null;
                return result;
            }

            var e = value[0];

            // new_cliente
            if (e.TryGetProperty("_new_cliente_value", out var clienteProp))
                result.ClienteId = clienteProp.GetGuid();

            // boolean
            result.Lavoratori = ReadBool(e, "new_lavoratori");
            result.Sedi = ReadBool(e, "cr4f9_sede");
            result.Dpi = ReadBool(e, "cr4f9_dpi");
            result.Formazione = ReadBool(e, "cr4f9_formazione");
            result.Cliente = ReadBool(e, "cr4f9_cliente");
            result.ImpiantiMacchinari = ReadBool(e, "cr4f9_impiantiemacchinari");

            _cache = result;
            _inflight = null;
            return result;
        }

        private static bool ReadBool(JsonElement entity, string fieldName)
        {
            if (!entity.TryGetProperty(fieldName, out var p))
                return false;

            return p.ValueKind switch
            {
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.String => ParseBoolString(p.GetString()),
                JsonValueKind.Number => p.TryGetInt32(out var n) && n == 1,
                _ => false
            };
        }

        private static bool ParseBoolString(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return false;
            return s == "1" || string.Equals(s, "true", StringComparison.OrdinalIgnoreCase);
        }

        private static string BuildFetchXml(string email) => $@"
<fetch top='1'>
  <entity name='new_emailautorizzazioniprv'>
    <attribute name='new_cliente' />
    <attribute name='new_lavoratori' />
    <attribute name='cr4f9_sede' />
    <attribute name='cr4f9_dpi' />
    <attribute name='cr4f9_formazione' />
    <attribute name='cr4f9_cliente' />
    <attribute name='cr4f9_impiantiemacchinari' />
    <filter>
      <condition attribute='new_email' operator='eq' value='{email}' />
    </filter>
  </entity>
</fetch>";
    }
}
