using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class AddedCustomization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ActiveAvatarFrameId",
                table: "AspNetUsers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ActiveAvatarId",
                table: "AspNetUsers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ActiveBackgroundId",
                table: "AspNetUsers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CustomizationItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<byte>(type: "tinyint", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UnlockedByDefault = table.Column<bool>(type: "bit", nullable: false),
                    UnlockedByLevelUp = table.Column<bool>(type: "bit", nullable: false),
                    Price = table.Column<int>(type: "int", nullable: false),
                    LevelRequired = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomizationItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserCustomizationItems",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomizationItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AcquiredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCustomizationItems", x => new { x.UserId, x.CustomizationItemId });
                    table.ForeignKey(
                        name: "FK_UserCustomizationItems_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCustomizationItems_CustomizationItems_CustomizationItemId",
                        column: x => x.CustomizationItemId,
                        principalTable: "CustomizationItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ActiveAvatarFrameId",
                table: "AspNetUsers",
                column: "ActiveAvatarFrameId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ActiveAvatarId",
                table: "AspNetUsers",
                column: "ActiveAvatarId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ActiveBackgroundId",
                table: "AspNetUsers",
                column: "ActiveBackgroundId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizationItems_CustomizationItemId",
                table: "UserCustomizationItems",
                column: "CustomizationItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveAvatarFrameId",
                table: "AspNetUsers",
                column: "ActiveAvatarFrameId",
                principalTable: "CustomizationItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveAvatarId",
                table: "AspNetUsers",
                column: "ActiveAvatarId",
                principalTable: "CustomizationItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveBackgroundId",
                table: "AspNetUsers",
                column: "ActiveBackgroundId",
                principalTable: "CustomizationItems",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveAvatarFrameId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveAvatarId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveBackgroundId",
                table: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "UserCustomizationItems");

            migrationBuilder.DropTable(
                name: "CustomizationItems");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ActiveAvatarFrameId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ActiveAvatarId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ActiveBackgroundId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ActiveAvatarFrameId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ActiveAvatarId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ActiveBackgroundId",
                table: "AspNetUsers");
        }
    }
}
