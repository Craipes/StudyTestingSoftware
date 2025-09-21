using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class AddedStudentGroups2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppUserStudentGroup_StudentGroup_StudentGroupsId",
                table: "AppUserStudentGroup");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGroup_AspNetUsers_OwnerId",
                table: "StudentGroup");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGroupTest_StudentGroup_OpenedToGroupsId",
                table: "StudentGroupTest");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StudentGroup",
                table: "StudentGroup");

            migrationBuilder.RenameTable(
                name: "StudentGroup",
                newName: "StudentGroups");

            migrationBuilder.RenameIndex(
                name: "IX_StudentGroup_OwnerId",
                table: "StudentGroups",
                newName: "IX_StudentGroups_OwnerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StudentGroups",
                table: "StudentGroups",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserStudentGroup_StudentGroups_StudentGroupsId",
                table: "AppUserStudentGroup",
                column: "StudentGroupsId",
                principalTable: "StudentGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGroups_AspNetUsers_OwnerId",
                table: "StudentGroups",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGroupTest_StudentGroups_OpenedToGroupsId",
                table: "StudentGroupTest",
                column: "OpenedToGroupsId",
                principalTable: "StudentGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppUserStudentGroup_StudentGroups_StudentGroupsId",
                table: "AppUserStudentGroup");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGroups_AspNetUsers_OwnerId",
                table: "StudentGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGroupTest_StudentGroups_OpenedToGroupsId",
                table: "StudentGroupTest");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StudentGroups",
                table: "StudentGroups");

            migrationBuilder.RenameTable(
                name: "StudentGroups",
                newName: "StudentGroup");

            migrationBuilder.RenameIndex(
                name: "IX_StudentGroups_OwnerId",
                table: "StudentGroup",
                newName: "IX_StudentGroup_OwnerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StudentGroup",
                table: "StudentGroup",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserStudentGroup_StudentGroup_StudentGroupsId",
                table: "AppUserStudentGroup",
                column: "StudentGroupsId",
                principalTable: "StudentGroup",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGroup_AspNetUsers_OwnerId",
                table: "StudentGroup",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGroupTest_StudentGroup_OpenedToGroupsId",
                table: "StudentGroupTest",
                column: "OpenedToGroupsId",
                principalTable: "StudentGroup",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
