using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser, AppRole, Guid>(options)
{
    public DbSet<CustomizationItem> CustomizationItems { get; set; } = null!;
    public DbSet<UserCustomizationItem> UserCustomizationItems { get; set; } = null!;

    // Tests
    public DbSet<Test> Tests { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<QuestionMatrixRow> QuestionMatrixRows { get; set; } = null!;
    public DbSet<QuestionMatrixColumn> QuestionMatrixColumns { get; set; } = null!;
    public DbSet<QuestionChoiceOption> QuestionChoices { get; set; } = null!;

    // Test sessions
    public DbSet<TestSession> TestSessions { get; set; } = null!;
    public DbSet<TestUserAnswer> TestUserAnswers { get; set; } = null!;

    // Student groups
    public DbSet<StudentGroup> StudentGroups { get; set; } = null!;

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

            // Customization
            entity.HasOne(au => au.ActiveAvatar)
                .WithMany()
                .HasForeignKey(au => au.ActiveAvatarId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(au => au.ActiveAvatarFrame)
                .WithMany()
                .HasForeignKey(au => au.ActiveAvatarFrameId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(au => au.ActiveBackground)
                .WithMany()
                .HasForeignKey(au => au.ActiveBackgroundId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<UserCustomizationItem>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.CustomizationItemId });

            entity.HasOne(uci => uci.User)
                .WithMany(u => u.OwnedCustomizationItems)
                .HasForeignKey(uci => uci.UserId)
                .OnDelete(DeleteBehavior.Cascade); // When a user is deleted, their ownership records are deleted.

            entity.HasOne(uci => uci.CustomizationItem)
                .WithMany() // Explicitly define the relationship
                .HasForeignKey(uci => uci.CustomizationItemId)
                .OnDelete(DeleteBehavior.Cascade); // Let's try Cascade here and change the other side.
        });

        // Change the cascade behavior on the other side of the conflict
        builder.Entity<CustomizationItem>(entity =>
        {
            entity.HasMany<AppUser>()
                .WithOne(au => au.ActiveAvatar)
                .HasForeignKey(au => au.ActiveAvatarId)
                .OnDelete(DeleteBehavior.NoAction); // Change to NoAction

            entity.HasMany<AppUser>()
                .WithOne(au => au.ActiveAvatarFrame)
                .HasForeignKey(au => au.ActiveAvatarFrameId)
                .OnDelete(DeleteBehavior.NoAction); // Change to NoAction

            entity.HasMany<AppUser>()
                .WithOne(au => au.ActiveBackground)
                .HasForeignKey(au => au.ActiveBackgroundId)
                .OnDelete(DeleteBehavior.NoAction); // Change to NoAction
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

        // Index to speed up periodic scans for expired sessions
        builder.Entity<TestSession>()
            .HasIndex(ts => new { ts.IsCompleted, ts.AutoFinishAt });
    }
}
