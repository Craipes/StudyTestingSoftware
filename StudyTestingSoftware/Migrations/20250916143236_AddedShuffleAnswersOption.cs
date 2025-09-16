using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class AddedShuffleAnswersOption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShuffleAnswers",
                table: "Questions",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShuffleAnswers",
                table: "Questions");
        }
    }
}
