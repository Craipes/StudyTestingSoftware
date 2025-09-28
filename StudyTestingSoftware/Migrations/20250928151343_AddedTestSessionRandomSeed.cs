using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class AddedTestSessionRandomSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RandomSeed",
                table: "TestSessions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_TestSessions_IsCompleted_AutoFinishAt",
                table: "TestSessions",
                columns: new[] { "IsCompleted", "AutoFinishAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TestSessions_IsCompleted_AutoFinishAt",
                table: "TestSessions");

            migrationBuilder.DropColumn(
                name: "RandomSeed",
                table: "TestSessions");
        }
    }
}
