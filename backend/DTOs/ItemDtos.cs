namespace backend.DTOs;

public record BudgetItemCreateDto(
    int CategoryId,
    string Description,
    decimal Quantity,
    decimal UnitValue,
    string? Notes
);

public record BudgetItemResponseDto(
    int Id,
    int ProjectId,
    int CategoryId,
    string CategoryName,
    string CategoryType,
    string Description,
    decimal Quantity,
    decimal UnitValue,
    decimal TotalValue,
    string? Notes,
    DateTime CreatedAt
);

public record ActualItemCreateDto(
    int CategoryId,
    int? BudgetItemId,
    string Description,
    decimal Quantity,
    decimal UnitValue,
    DateOnly Date,
    string? InvoiceNumber,
    string? Notes
);

public record ActualItemResponseDto(
    int Id,
    int ProjectId,
    int CategoryId,
    string CategoryName,
    string CategoryType,
    int? BudgetItemId,
    string Description,
    decimal Quantity,
    decimal UnitValue,
    decimal TotalValue,
    DateOnly Date,
    string? InvoiceNumber,
    string? Notes,
    DateTime CreatedAt
);
