namespace backend.DTOs;

public record ProjectCreateDto(
    string Name,
    string? Description,
    DateOnly? StartDate,
    DateOnly? EndDate,
    decimal TotalBudget
);

public record ProjectResponseDto(
    int Id,
    string Name,
    string? Description,
    DateOnly? StartDate,
    DateOnly? EndDate,
    decimal TotalBudget,
    DateTime CreatedAt
);
