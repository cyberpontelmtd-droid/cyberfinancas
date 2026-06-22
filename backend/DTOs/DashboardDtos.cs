namespace backend.DTOs;

public record DashboardDto(
    decimal TotalBudget,
    decimal TotalBudgeted,
    decimal TotalActual,
    double ExecutionPercentage,
    decimal Remaining,
    IEnumerable<CategorySummaryDto> ByCategory,
    IEnumerable<BudgetItemResponseDto> PendingItems
);

public record CategorySummaryDto(
    int CategoryId,
    string CategoryName,
    string CategoryType,
    decimal Budgeted,
    decimal Actual,
    double ExecutionPercentage
);
