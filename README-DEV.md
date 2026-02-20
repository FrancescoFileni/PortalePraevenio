# BlazorPortal — Development notes

Run locally:

```powershell
dotnet restore
dotnet build
dotnet run --project BlazorPortal/BlazorPortal.csproj
```

Dev checklist:
- MudBlazor theme defined in `Shared/AppTheme.cs`.
- Global styles in `wwwroot/css/layout-extras.css`.
- CI workflow: `.github/workflows/dotnet.yml`.

Next recommended steps:
- Triage/resolve CS8618 nullable warnings.
- Align MudBlazor attributes to v7 API.
- Replace legacy NuGet packages that target .NET Framework.
