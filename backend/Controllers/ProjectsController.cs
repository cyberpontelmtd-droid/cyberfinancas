using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectsController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await db.Projects
            .Where(p => p.UserId == UserId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectResponseDto(p.Id, p.Name, p.Description, p.StartDate, p.EndDate, p.TotalBudget, p.CreatedAt))
            .ToListAsync();

        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == UserId);
        if (p is null) return NotFound();

        return Ok(new ProjectResponseDto(p.Id, p.Name, p.Description, p.StartDate, p.EndDate, p.TotalBudget, p.CreatedAt));
    }

    [HttpPost]
    public async Task<IActionResult> Create(ProjectCreateDto dto)
    {
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            TotalBudget = dto.TotalBudget,
            UserId = UserId
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = project.Id },
            new ProjectResponseDto(project.Id, project.Name, project.Description, project.StartDate, project.EndDate, project.TotalBudget, project.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ProjectCreateDto dto)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == UserId);
        if (project is null) return NotFound();

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.TotalBudget = dto.TotalBudget;

        await db.SaveChangesAsync();
        return Ok(new ProjectResponseDto(project.Id, project.Name, project.Description, project.StartDate, project.EndDate, project.TotalBudget, project.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == UserId);
        if (project is null) return NotFound();

        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
