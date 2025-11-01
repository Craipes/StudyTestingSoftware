using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class ChangedCustomizationItemKeyType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropForeignKey(
                name: "FK_UserCustomizationItems_CustomizationItems_CustomizationItemId",
                table: "UserCustomizationItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserCustomizationItems",
                table: "UserCustomizationItems");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizationItems_CustomizationItemId",
                table: "UserCustomizationItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CustomizationItems",
                table: "CustomizationItems");

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
                name: "CustomizationItemId",
                table: "UserCustomizationItems");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "CustomizationItems");

            migrationBuilder.DropColumn(
                name: "ActiveAvatarFrameId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ActiveAvatarId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ActiveBackgroundId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "CustomizationItemCodeId",
                table: "UserCustomizationItems",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CodeId",
                table: "CustomizationItems",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ActiveAvatarCodeId",
                table: "AspNetUsers",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActiveAvatarFrameCodeId",
                table: "AspNetUsers",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActiveBackgroundCodeId",
                table: "AspNetUsers",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserCustomizationItems",
                table: "UserCustomizationItems",
                columns: new[] { "UserId", "CustomizationItemCodeId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_CustomizationItems",
                table: "CustomizationItems",
                column: "CodeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizationItems_CustomizationItemCodeId",
                table: "UserCustomizationItems",
                column: "CustomizationItemCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ActiveAvatarCodeId",
                table: "AspNetUsers",
                column: "ActiveAvatarCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ActiveAvatarFrameCodeId",
                table: "AspNetUsers",
                column: "ActiveAvatarFrameCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ActiveBackgroundCodeId",
                table: "AspNetUsers",
                column: "ActiveBackgroundCodeId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveAvatarCodeId",
                table: "AspNetUsers",
                column: "ActiveAvatarCodeId",
                principalTable: "CustomizationItems",
                principalColumn: "CodeId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveAvatarFrameCodeId",
                table: "AspNetUsers",
                column: "ActiveAvatarFrameCodeId",
                principalTable: "CustomizationItems",
                principalColumn: "CodeId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveBackgroundCodeId",
                table: "AspNetUsers",
                column: "ActiveBackgroundCodeId",
                principalTable: "CustomizationItems",
                principalColumn: "CodeId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserCustomizationItems_CustomizationItems_CustomizationItemCodeId",
                table: "UserCustomizationItems",
                column: "CustomizationItemCodeId",
                principalTable: "CustomizationItems",
                principalColumn: "CodeId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveAvatarCodeId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveAvatarFrameCodeId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_CustomizationItems_ActiveBackgroundCodeId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCustomizationItems_CustomizationItems_CustomizationItemCodeId",
                table: "UserCustomizationItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserCustomizationItems",
                table: "UserCustomizationItems");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizationItems_CustomizationItemCodeId",
                table: "UserCustomizationItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CustomizationItems",
                table: "CustomizationItems");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ActiveAvatarCodeId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ActiveAvatarFrameCodeId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ActiveBackgroundCodeId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CustomizationItemCodeId",
                table: "UserCustomizationItems");

            migrationBuilder.DropColumn(
                name: "CodeId",
                table: "CustomizationItems");

            migrationBuilder.DropColumn(
                name: "ActiveAvatarCodeId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ActiveAvatarFrameCodeId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ActiveBackgroundCodeId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomizationItemId",
                table: "UserCustomizationItems",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "CustomizationItems",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

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

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserCustomizationItems",
                table: "UserCustomizationItems",
                columns: new[] { "UserId", "CustomizationItemId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_CustomizationItems",
                table: "CustomizationItems",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizationItems_CustomizationItemId",
                table: "UserCustomizationItems",
                column: "CustomizationItemId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_UserCustomizationItems_CustomizationItems_CustomizationItemId",
                table: "UserCustomizationItems",
                column: "CustomizationItemId",
                principalTable: "CustomizationItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
