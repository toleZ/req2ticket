using Application.Services;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Web.Authorization;

/* You don't need to read this file to add an endpoint: put the attribute on the action and that's it.

     [RequireProjectMember]                              any member may read (on the controller)
     [RequireProjectPermission(Permission.EpicsManage)]  this action needs that permission
     [RequirePlatformPermission(Permission.UsersManage)] platform-wide, SuperAdmin only

   They are resource filters, so they run before model binding: someone outside the project gets
   404 without ever seeing the body's validation errors. The project id is always the {pid} of the
   route — never something in the body.

     not a member (and not SuperAdmin) → 404 "Project not found."   (doesn't reveal it exists)
     member without the permission    → 403 "You don't have permission to do this."
     archived project and a write     → 400 "Project is archived." */
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireProjectMemberAttribute : Attribute, IAsyncResourceFilter
{
    protected virtual Permission? RequiredPermission => null;

    public async Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
    {
        IActionResult? refusal = await CheckAsync(context);
        if (refusal is not null)
        {
            context.Result = refusal;
            return;
        }

        await next();
    }

    private async Task<IActionResult?> CheckAsync(ResourceExecutingContext context)
    {
        if (!int.TryParse(context.RouteData.Values["pid"]?.ToString(), out int projectId))
        {
            return NotFound();
        }

        IServiceProvider services = context.HttpContext.RequestServices;
        int userId = services.GetRequiredService<CurrentUser>().Id;
        ProjectAccess? access = await services.GetRequiredService<ProjectAccessService>().GetAsync(projectId, userId);

        if (access is null)
        {
            return NotFound();
        }

        if (RequiredPermission is not Permission permission)
        {
            return null;
        }

        if (!access.Has(permission))
        {
            return Forbidden();
        }

        if (access.IsArchived && !ProjectPermissions.AllowedWhileArchived.Contains(permission))
        {
            return new BadRequestObjectResult(new { message = "Project is archived." });
        }

        return null;
    }

    private static NotFoundObjectResult NotFound() => new(new { message = "Project not found." });

    internal static ObjectResult Forbidden() =>
        new(new { message = "You don't have permission to do this." }) { StatusCode = StatusCodes.Status403Forbidden };
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireProjectPermissionAttribute : RequireProjectMemberAttribute
{
    private readonly Permission _permission;

    public RequireProjectPermissionAttribute(Permission permission)
    {
        _permission = permission;
    }

    protected override Permission? RequiredPermission => _permission;
}

// For endpoints outside any project. Reads the platform role from the database, not the token, so a
// demoted SuperAdmin loses access on the next request.
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequirePlatformPermissionAttribute : Attribute, IAsyncResourceFilter
{
    private readonly Permission _permission;

    public RequirePlatformPermissionAttribute(Permission permission)
    {
        _permission = permission;
    }

    public async Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
    {
        IServiceProvider services = context.HttpContext.RequestServices;
        int userId = services.GetRequiredService<CurrentUser>().Id;
        User? user = await services.GetRequiredService<IUserRepository>().GetByIdAsync(userId);

        bool allowed = user is not null && ProjectPermissions.Has(null, user.PlatformRole, _permission);
        if (!allowed)
        {
            context.Result = RequireProjectMemberAttribute.Forbidden();
            return;
        }

        await next();
    }
}
