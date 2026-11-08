using Domain.Common;
using Microsoft.AspNetCore.Mvc;
using Web.DTOs;

namespace Web.Controllers;

// What each project role may do, straight from ProjectPermissions. The screens that explain roles
// (the role picker, "¿Qué puede hacer cada rol?") read this instead of keeping a copy of the matrix.
[Route("api/roles")]
[ApiController]
public class RolesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() =>
        Ok(ProjectPermissions.RoleCatalog().Select(entry => new RoleResponse(entry.Role, entry.Permissions)));
}
