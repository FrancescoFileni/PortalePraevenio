using BlazorPortal.Models;

namespace BlazorPortal.Services;

public interface IPermessiService
{
    Task<PermessiUtente> GetPermessiAsync();
    void Invalidate();
}
