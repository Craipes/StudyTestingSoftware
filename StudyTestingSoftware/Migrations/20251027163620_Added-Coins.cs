using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class AddedCoins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxCoins",
                table: "Tests",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxCoins",
                table: "Tests");
        }
    }
}
