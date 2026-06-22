namespace backend.Models;

public class ActualItem
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int CategoryId { get; set; }
    public int? BudgetItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public decimal UnitValue { get; set; }
    public DateOnly Date { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public decimal TotalValue => Quantity * UnitValue;

    public Project Project { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public BudgetItem? BudgetItem { get; set; }
}
