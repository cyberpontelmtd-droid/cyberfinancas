using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cats = await db.Categories
            .OrderBy(c => c.Type).ThenBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.Type })
            .ToListAsync();
        return Ok(cats);
    }
}
