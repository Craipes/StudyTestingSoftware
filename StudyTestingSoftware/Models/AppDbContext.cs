using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Models;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser, AppRole, Guid>(options)
{
    public DbSet<Test> Tests { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<AnswerRow> AnswerRows { get; set; } = null!;
    public DbSet<AnswerOption> AnswerOptions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Test>()
            .HasOne(t => t.Author)
            .WithMany(u => u.AuthoredTests)
            .HasForeignKey(t => t.AuthorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<AnswerOption>()
            .HasOne(ao => ao.Question)
            .WithMany()
            .HasForeignKey(ao => ao.QuestionId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
