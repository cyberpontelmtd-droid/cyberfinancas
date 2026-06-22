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
public class ActualItemsController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("api/projects/{projectId}/actual-items")]
    public async Task<IActionResult> GetByProject(int projectId)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == UserId);
        if (project is null) return NotFound();

        var items = await db.ActualItems
            .Include(a => a.Category)
            .Where(a => a.ProjectId == projectId)
            .OrderByDescending(a => a.Date)
            .Select(a => ToDto(a))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("api/projects/{projectId}/actual-items")]
    public async Task<IActionResult> Create(int projectId, ActualItemCreateDto dto)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == UserId);
        if (project is null) return NotFound();

        var item = new ActualItem
        {
            ProjectId = projectId,
            CategoryId = dto.CategoryId,
            BudgetItemId = dto.BudgetItemId,
            Description = dto.Description,
            Quantity = dto.Quantity,
            UnitValue = dto.UnitValue,
            Date = dto.Date,
            InvoiceNumber = dto.InvoiceNumber,
            Notes = dto.Notes
        };

        db.ActualItems.Add(item);
        await db.SaveChangesAsync();

        await db.Entry(item).Reference(i => i.Category).LoadAsync();
        return CreatedAtAction(nameof(GetByProject), new { projectId }, ToDto(item));
    }

    [HttpPut("api/actual-items/{id}")]
    public async Task<IActionResult> Update(int id, ActualItemCreateDto dto)
    {
        var item = await db.ActualItems
            .Include(a => a.Project)
            .Include(a => a.Category)
            .FirstOrDefaultAsync(a => a.Id == id && a.Project.UserId == UserId);

        if (item is null) return NotFound();

        item.CategoryId = dto.CategoryId;
        item.BudgetItemId = dto.BudgetItemId;
        item.Description = dto.Description;
        item.Quantity = dto.Quantity;
        item.UnitValue = dto.UnitValue;
        item.Date = dto.Date;
        item.InvoiceNumber = dto.InvoiceNumber;
        item.Notes = dto.Notes;

        await db.SaveChangesAsync();
        await db.Entry(item).Reference(i => i.Category).LoadAsync();
        return Ok(ToDto(item));
    }

    [HttpDelete("api/actual-items/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.ActualItems
            .Include(a => a.Project)
            .FirstOrDefaultAsync(a => a.Id == id && a.Project.UserId == UserId);

        if (item is null) return NotFound();

        db.ActualItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static ActualItemResponseDto ToDto(ActualItem a) => new(
        a.Id, a.ProjectId, a.CategoryId, a.Category.Name, a.Category.Type,
        a.BudgetItemId, a.Description, a.Quantity, a.UnitValue, a.TotalValue,
        a.Date, a.InvoiceNumber, a.Notes, a.CreatedAt
    );
}
