using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Models;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser, AppRole, Guid>(options)
{
    public DbSet<Test> Tests { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<QuestionMatrixRow> QuestionMatrixRows { get; set; } = null!;
    public DbSet<QuestionMatrixColumn> QuestionMatrixColumns { get; set; } = null!;
    public DbSet<QuestionChoiceOption> QuestionChoices { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Test>()
            .HasOne(t => t.Author)
            .WithMany(u => u.AuthoredTests)
            .HasForeignKey(t => t.AuthorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<QuestionMatrixRow>()
            .HasOne(qmc => qmc.CorrectMatrixColumn)
            .WithMany()
            .HasForeignKey(qmc => qmc.CorrectMatrixColumnId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
