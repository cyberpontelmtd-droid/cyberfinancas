using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/projects/{projectId}/dashboard")]
[Authorize]
public class DashboardController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Get(int projectId)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == UserId);
        if (project is null) return NotFound();

        var budgetItems = await db.BudgetItems
            .Include(b => b.Category)
            .Where(b => b.ProjectId == projectId)
            .ToListAsync();

        var actualItems = await db.ActualItems
            .Include(a => a.Category)
            .Where(a => a.ProjectId == projectId)
            .ToListAsync();

        var totalBudgeted = budgetItems.Sum(b => b.TotalValue);
        var totalActual = actualItems.Sum(a => a.TotalValue);
        var executionPct = totalBudgeted > 0 ? (double)(totalActual / totalBudgeted) * 100 : 0;

        var categories = budgetItems.Select(b => b.Category)
            .Union(actualItems.Select(a => a.Category))
            .DistinctBy(c => c.Id);

        var byCategory = categories.Select(cat =>
        {
            var budgeted = budgetItems.Where(b => b.CategoryId == cat.Id).Sum(b => b.TotalValue);
            var actual = actualItems.Where(a => a.CategoryId == cat.Id).Sum(a => a.TotalValue);
            var pct = budgeted > 0 ? (double)(actual / budgeted) * 100 : 0;
            return new CategorySummaryDto(cat.Id, cat.Name, cat.Type, budgeted, actual, Math.Round(pct, 1));
        }).OrderBy(c => c.CategoryType).ThenBy(c => c.CategoryName);

        var pendingItems = budgetItems
            .Where(b => !actualItems.Any(a => a.BudgetItemId == b.Id))
            .Select(b => new BudgetItemResponseDto(
                b.Id, b.ProjectId, b.CategoryId, b.Category.Name, b.Category.Type,
                b.Description, b.Quantity, b.UnitValue, b.TotalValue, b.Notes, b.CreatedAt
            ));

        return Ok(new DashboardDto(
            project.TotalBudget,
            totalBudgeted,
            totalActual,
            Math.Round(executionPct, 1),
            totalBudgeted - totalActual,
            byCategory,
            pendingItems
        ));
    }
}
