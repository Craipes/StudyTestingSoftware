using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class AddedTestSessionsEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxScore",
                table: "Tests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "TestSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AutoFinishAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Score = table.Column<double>(type: "float", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestSessions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TestSessions_Tests_TestId",
                        column: x => x.TestId,
                        principalTable: "Tests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TestUserAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SelectedChoiceOptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SelectedMatrixRowId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SelectedMatrixColumnId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NumberValue = table.Column<double>(type: "float", nullable: true),
                    BoolValue = table.Column<bool>(type: "bit", nullable: true),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestUserAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestUserAnswers_QuestionChoices_SelectedChoiceOptionId",
                        column: x => x.SelectedChoiceOptionId,
                        principalTable: "QuestionChoices",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TestUserAnswers_QuestionMatrixColumns_SelectedMatrixColumnId",
                        column: x => x.SelectedMatrixColumnId,
                        principalTable: "QuestionMatrixColumns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TestUserAnswers_QuestionMatrixRows_SelectedMatrixRowId",
                        column: x => x.SelectedMatrixRowId,
                        principalTable: "QuestionMatrixRows",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TestUserAnswers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TestUserAnswers_TestSessions_TestSessionId",
                        column: x => x.TestSessionId,
                        principalTable: "TestSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TestSessions_TestId",
                table: "TestSessions",
                column: "TestId");

            migrationBuilder.CreateIndex(
                name: "IX_TestSessions_UserId",
                table: "TestSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TestUserAnswers_QuestionId",
                table: "TestUserAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_TestUserAnswers_SelectedChoiceOptionId",
                table: "TestUserAnswers",
                column: "SelectedChoiceOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_TestUserAnswers_SelectedMatrixColumnId",
                table: "TestUserAnswers",
                column: "SelectedMatrixColumnId");

            migrationBuilder.CreateIndex(
                name: "IX_TestUserAnswers_SelectedMatrixRowId",
                table: "TestUserAnswers",
                column: "SelectedMatrixRowId");

            migrationBuilder.CreateIndex(
                name: "IX_TestUserAnswers_TestSessionId",
                table: "TestUserAnswers",
                column: "TestSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TestUserAnswers");

            migrationBuilder.DropTable(
                name: "TestSessions");

            migrationBuilder.DropColumn(
                name: "MaxScore",
                table: "Tests");
        }
    }
}
