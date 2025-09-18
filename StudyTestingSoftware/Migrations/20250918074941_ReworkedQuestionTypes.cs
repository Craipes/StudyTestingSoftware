using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTestingSoftware.Migrations
{
    /// <inheritdoc />
    public partial class ReworkedQuestionTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnswerOptions");

            migrationBuilder.DropTable(
                name: "AnswerRows");

            migrationBuilder.CreateTable(
                name: "QuestionChoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionChoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionChoices_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionMatrixColumns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionMatrixColumns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionMatrixColumns_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionMatrixRows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CorrectMatrixColumnId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionMatrixRows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionMatrixRows_QuestionMatrixColumns_CorrectMatrixColumnId",
                        column: x => x.CorrectMatrixColumnId,
                        principalTable: "QuestionMatrixColumns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_QuestionMatrixRows_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuestionChoices_QuestionId",
                table: "QuestionChoices",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionMatrixColumns_QuestionId",
                table: "QuestionMatrixColumns",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionMatrixRows_CorrectMatrixColumnId",
                table: "QuestionMatrixRows",
                column: "CorrectMatrixColumnId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionMatrixRows_QuestionId",
                table: "QuestionMatrixRows",
                column: "QuestionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuestionChoices");

            migrationBuilder.DropTable(
                name: "QuestionMatrixRows");

            migrationBuilder.DropTable(
                name: "QuestionMatrixColumns");

            migrationBuilder.CreateTable(
                name: "AnswerRows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnswerRows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnswerRows_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnswerOptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AnswerRowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnswerOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnswerOptions_AnswerRows_AnswerRowId",
                        column: x => x.AnswerRowId,
                        principalTable: "AnswerRows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AnswerOptions_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnswerOptions_AnswerRowId",
                table: "AnswerOptions",
                column: "AnswerRowId");

            migrationBuilder.CreateIndex(
                name: "IX_AnswerOptions_QuestionId",
                table: "AnswerOptions",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_AnswerRows_QuestionId",
                table: "AnswerRows",
                column: "QuestionId");
        }
    }
}
