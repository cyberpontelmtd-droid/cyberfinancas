using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Authorize]
public class BudgetItemsController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("api/projects/{projectId}/budget-items")]
    public async Task<IActionResult> GetByProject(int projectId)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == UserId);
        if (project is null) return NotFound();

        var items = await db.BudgetItems
            .Include(b => b.Category)
            .Where(b => b.ProjectId == projectId)
            .OrderBy(b => b.Category.Type).ThenBy(b => b.Description)
            .Select(b => ToDto(b))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("api/projects/{projectId}/budget-items")]
    public async Task<IActionResult> Create(int projectId, BudgetItemCreateDto dto)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == UserId);
        if (project is null) return NotFound();

        var item = new BudgetItem
        {
            ProjectId = projectId,
            CategoryId = dto.CategoryId,
            Description = dto.Description,
            Quantity = dto.Quantity,
            UnitValue = dto.UnitValue,
            Notes = dto.Notes
        };

        db.BudgetItems.Add(item);
        await db.SaveChangesAsync();

        await db.Entry(item).Reference(i => i.Category).LoadAsync();
        return CreatedAtAction(nameof(GetByProject), new { projectId }, ToDto(item));
    }

    [HttpPut("api/budget-items/{id}")]
    public async Task<IActionResult> Update(int id, BudgetItemCreateDto dto)
    {
        var item = await db.BudgetItems
            .Include(b => b.Project)
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.Project.UserId == UserId);

        if (item is null) return NotFound();

        item.CategoryId = dto.CategoryId;
        item.Description = dto.Description;
        item.Quantity = dto.Quantity;
        item.UnitValue = dto.UnitValue;
        item.Notes = dto.Notes;

        await db.SaveChangesAsync();
        await db.Entry(item).Reference(i => i.Category).LoadAsync();
        return Ok(ToDto(item));
    }

    [HttpDelete("api/budget-items/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.BudgetItems
            .Include(b => b.Project)
            .FirstOrDefaultAsync(b => b.Id == id && b.Project.UserId == UserId);

        if (item is null) return NotFound();

        db.BudgetItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static BudgetItemResponseDto ToDto(BudgetItem b) => new(
        b.Id, b.ProjectId, b.CategoryId, b.Category.Name, b.Category.Type,
        b.Description, b.Quantity, b.UnitValue, b.TotalValue, b.Notes, b.CreatedAt
    );
}
