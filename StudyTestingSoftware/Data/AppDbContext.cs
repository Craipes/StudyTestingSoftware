using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser, AppRole, Guid>(options)
{
    // Tests
    public DbSet<Test> Tests { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<QuestionMatrixRow> QuestionMatrixRows { get; set; } = null!;
    public DbSet<QuestionMatrixColumn> QuestionMatrixColumns { get; set; } = null!;
    public DbSet<QuestionChoiceOption> QuestionChoices { get; set; } = null!;

    // Test sessions
    public DbSet<TestSession> TestSessions { get; set; } = null!;
    public DbSet<TestUserAnswer> TestUserAnswers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>(entity =>
        {
            entity.HasMany(au => au.OwnedStudentGroups)
                .WithOne(sg => sg.Owner)
                .HasForeignKey(sg => sg.OwnerId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(au => au.StudentGroups)
                .WithMany(sg => sg.Students);
        });

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

        builder.Entity<TestUserAnswer>()
            .HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
