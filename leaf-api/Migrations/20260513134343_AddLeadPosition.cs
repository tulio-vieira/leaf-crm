using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeafAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadPosition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Leads_BoardId",
                table: "Leads");

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Leads_BoardId_ColumnIdx_Position",
                table: "Leads",
                columns: new[] { "BoardId", "ColumnIdx", "Position" });

            migrationBuilder.Sql(@"
                WITH ranked AS (
                    SELECT ""Id"",
                           ROW_NUMBER() OVER (PARTITION BY ""BoardId"", ""ColumnIdx"" ORDER BY ""Id"") - 1 AS rn
                    FROM ""Leads""
                )
                UPDATE ""Leads"" l
                SET ""Position"" = 'a' || ranked.rn::text
                FROM ranked
                WHERE l.""Id"" = ranked.""Id"";
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Leads_BoardId_ColumnIdx_Position",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Leads");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_BoardId",
                table: "Leads",
                column: "BoardId");
        }
    }
}
