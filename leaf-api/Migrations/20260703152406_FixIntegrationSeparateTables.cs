using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LeafAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixIntegrationSeparateTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Integration_Boards_BoardId",
                table: "Integration");

            migrationBuilder.DropForeignKey(
                name: "FK_Integration_Leads_LeadId",
                table: "Integration");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Integration",
                table: "Integration");

            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "Integration");

            migrationBuilder.DropColumn(
                name: "Items",
                table: "Integration");

            migrationBuilder.RenameTable(
                name: "Integration",
                newName: "LoggiIntegrations");

            migrationBuilder.RenameIndex(
                name: "IX_Integration_LeadId",
                table: "LoggiIntegrations",
                newName: "IX_LoggiIntegrations_LeadId");

            migrationBuilder.RenameIndex(
                name: "IX_Integration_BoardId",
                table: "LoggiIntegrations",
                newName: "IX_LoggiIntegrations_BoardId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LoggiIntegrations",
                table: "LoggiIntegrations",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "InfinitePayIntegrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LeadId = table.Column<int>(type: "integer", nullable: false),
                    BoardId = table.Column<int>(type: "integer", nullable: false),
                    Link = table.Column<string>(type: "text", nullable: false),
                    Webhook_RequestSent = table.Column<string>(type: "jsonb", nullable: false),
                    Webhook_ResponsePayload = table.Column<string>(type: "jsonb", nullable: false),
                    Webhook_ResponseStatus = table.Column<int>(type: "integer", nullable: false),
                    Webhook_PayloadReceived = table.Column<string>(type: "jsonb", nullable: true),
                    Webhook_PayloadReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Items = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InfinitePayIntegrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InfinitePayIntegrations_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InfinitePayIntegrations_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InfinitePayIntegrations_BoardId",
                table: "InfinitePayIntegrations",
                column: "BoardId");

            migrationBuilder.CreateIndex(
                name: "IX_InfinitePayIntegrations_LeadId",
                table: "InfinitePayIntegrations",
                column: "LeadId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoggiIntegrations_Boards_BoardId",
                table: "LoggiIntegrations",
                column: "BoardId",
                principalTable: "Boards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LoggiIntegrations_Leads_LeadId",
                table: "LoggiIntegrations",
                column: "LeadId",
                principalTable: "Leads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoggiIntegrations_Boards_BoardId",
                table: "LoggiIntegrations");

            migrationBuilder.DropForeignKey(
                name: "FK_LoggiIntegrations_Leads_LeadId",
                table: "LoggiIntegrations");

            migrationBuilder.DropTable(
                name: "InfinitePayIntegrations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LoggiIntegrations",
                table: "LoggiIntegrations");

            migrationBuilder.RenameTable(
                name: "LoggiIntegrations",
                newName: "Integration");

            migrationBuilder.RenameIndex(
                name: "IX_LoggiIntegrations_LeadId",
                table: "Integration",
                newName: "IX_Integration_LeadId");

            migrationBuilder.RenameIndex(
                name: "IX_LoggiIntegrations_BoardId",
                table: "Integration",
                newName: "IX_Integration_BoardId");

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "Integration",
                type: "character varying(34)",
                maxLength: 34,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Items",
                table: "Integration",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Integration",
                table: "Integration",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Integration_Boards_BoardId",
                table: "Integration",
                column: "BoardId",
                principalTable: "Boards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Integration_Leads_LeadId",
                table: "Integration",
                column: "LeadId",
                principalTable: "Leads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
