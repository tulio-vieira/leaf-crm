using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LeafAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddIntegrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "IntegrationSequence");

            migrationBuilder.AddColumn<bool>(
                name: "InfinitePaySetting_AllowBypassRules",
                table: "Boards",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "InfinitePaySetting_DestinationColumn",
                table: "Boards",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "InfinitePaySetting_Enabled",
                table: "Boards",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "LoggiSetting_AllowBypassRules",
                table: "Boards",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "LoggiSetting_DestinationColumn",
                table: "Boards",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "LoggiSetting_Enabled",
                table: "Boards",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "InfinitePayIntegrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('\"IntegrationSequence\"')"),
                    LeadId = table.Column<int>(type: "integer", nullable: false),
                    BoardId = table.Column<int>(type: "integer", nullable: false),
                    Link = table.Column<string>(type: "text", nullable: false),
                    Webhook_RequestSent = table.Column<string>(type: "jsonb", nullable: false),
                    Webhook_ResponsePayload = table.Column<string>(type: "jsonb", nullable: false),
                    Webhook_ResponseStatus = table.Column<int>(type: "integer", nullable: false),
                    Webhook_PayloadReceived = table.Column<string>(type: "jsonb", nullable: true),
                    Webhook_PayloadReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "LoggiIntegrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('\"IntegrationSequence\"')"),
                    LeadId = table.Column<int>(type: "integer", nullable: false),
                    BoardId = table.Column<int>(type: "integer", nullable: false),
                    Link = table.Column<string>(type: "text", nullable: false),
                    Webhook_RequestSent = table.Column<string>(type: "jsonb", nullable: false),
                    Webhook_ResponsePayload = table.Column<string>(type: "jsonb", nullable: false),
                    Webhook_ResponseStatus = table.Column<int>(type: "integer", nullable: false),
                    Webhook_PayloadReceived = table.Column<string>(type: "jsonb", nullable: true),
                    Webhook_PayloadReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoggiIntegrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoggiIntegrations_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LoggiIntegrations_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AmountCents = table.Column<int>(type: "integer", nullable: false),
                    LeadId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Leads_LeadId",
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

            migrationBuilder.CreateIndex(
                name: "IX_LoggiIntegrations_BoardId",
                table: "LoggiIntegrations",
                column: "BoardId");

            migrationBuilder.CreateIndex(
                name: "IX_LoggiIntegrations_LeadId",
                table: "LoggiIntegrations",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_LeadId",
                table: "Payments",
                column: "LeadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InfinitePayIntegrations");

            migrationBuilder.DropTable(
                name: "LoggiIntegrations");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropColumn(
                name: "InfinitePaySetting_AllowBypassRules",
                table: "Boards");

            migrationBuilder.DropColumn(
                name: "InfinitePaySetting_DestinationColumn",
                table: "Boards");

            migrationBuilder.DropColumn(
                name: "InfinitePaySetting_Enabled",
                table: "Boards");

            migrationBuilder.DropColumn(
                name: "LoggiSetting_AllowBypassRules",
                table: "Boards");

            migrationBuilder.DropColumn(
                name: "LoggiSetting_DestinationColumn",
                table: "Boards");

            migrationBuilder.DropColumn(
                name: "LoggiSetting_Enabled",
                table: "Boards");

            migrationBuilder.DropSequence(
                name: "IntegrationSequence");
        }
    }
}
