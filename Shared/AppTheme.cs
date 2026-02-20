using MudBlazor;

namespace BlazorPortal.Shared
{
    public static class AppTheme
    {
        // Keep theme minimal and compatible with the installed MudBlazor package.
        // Palette/typography APIs differ between MudBlazor versions; to avoid
        // build-time errors we only set layout properties here.
        public static MudTheme Theme { get; } = new MudTheme
        {
            LayoutProperties = new LayoutProperties
            {
                DefaultBorderRadius = "10px"
            }
        };
    }
}
