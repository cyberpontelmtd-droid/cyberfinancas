namespace backend.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public decimal TotalBudget { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<BudgetItem> BudgetItems { get; set; } = new List<BudgetItem>();
    public ICollection<ActualItem> ActualItems { get; set; } = new List<ActualItem>();
}
