using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class AddedStudentGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StudentGroup",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentGroup", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentGroup_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "AppUserStudentGroup",
                columns: table => new
                {
                    StudentGroupsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUserStudentGroup", x => new { x.StudentGroupsId, x.StudentsId });
                    table.ForeignKey(
                        name: "FK_AppUserStudentGroup_AspNetUsers_StudentsId",
                        column: x => x.StudentsId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppUserStudentGroup_StudentGroup_StudentGroupsId",
                        column: x => x.StudentGroupsId,
                        principalTable: "StudentGroup",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentGroupTest",
                columns: table => new
                {
                    OpenedTestsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OpenedToGroupsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentGroupTest", x => new { x.OpenedTestsId, x.OpenedToGroupsId });
                    table.ForeignKey(
                        name: "FK_StudentGroupTest_StudentGroup_OpenedToGroupsId",
                        column: x => x.OpenedToGroupsId,
                        principalTable: "StudentGroup",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentGroupTest_Tests_OpenedTestsId",
                        column: x => x.OpenedTestsId,
                        principalTable: "Tests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppUserStudentGroup_StudentsId",
                table: "AppUserStudentGroup",
                column: "StudentsId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentGroup_OwnerId",
                table: "StudentGroup",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentGroupTest_OpenedToGroupsId",
                table: "StudentGroupTest",
                column: "OpenedToGroupsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppUserStudentGroup");

            migrationBuilder.DropTable(
                name: "StudentGroupTest");

            migrationBuilder.DropTable(
                name: "StudentGroup");
        }
    }
}
