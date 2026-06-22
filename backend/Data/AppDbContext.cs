using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<BudgetItem> BudgetItems => Set<BudgetItem>();
    public DbSet<ActualItem> ActualItems => Set<ActualItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasDefaultValue("user");
        });

        modelBuilder.Entity<Project>(e =>
        {
            e.Property(p => p.TotalBudget).HasColumnType("decimal(15,2)");
        });

        modelBuilder.Entity<BudgetItem>(e =>
        {
            e.Property(b => b.Quantity).HasColumnType("decimal(10,2)");
            e.Property(b => b.UnitValue).HasColumnType("decimal(15,2)");
            e.Ignore(b => b.TotalValue);
        });

        modelBuilder.Entity<ActualItem>(e =>
        {
            e.Property(a => a.Quantity).HasColumnType("decimal(10,2)");
            e.Property(a => a.UnitValue).HasColumnType("decimal(15,2)");
            e.Ignore(a => a.TotalValue);
        });

        // Seed default categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Diárias", Type = "custeio" },
            new Category { Id = 2, Name = "Passagens", Type = "custeio" },
            new Category { Id = 3, Name = "Material de Consumo", Type = "custeio" },
            new Category { Id = 4, Name = "Serviços de Terceiros", Type = "custeio" },
            new Category { Id = 5, Name = "Material Permanente", Type = "capital" }
        );
    }
}
