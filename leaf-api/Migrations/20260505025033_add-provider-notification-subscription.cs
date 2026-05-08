using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LogosAPI.Migrations
{
    /// <inheritdoc />
    public partial class addprovidernotificationsubscription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProviderNotificationSubscriptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserEmail = table.Column<string>(type: "text", nullable: false),
                    ProviderSlug = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProviderNotificationSubscriptions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProviderNotificationSubscriptions_ProviderSlug",
                table: "ProviderNotificationSubscriptions",
                column: "ProviderSlug");

            migrationBuilder.CreateIndex(
                name: "IX_ProviderNotificationSubscriptions_UserEmail_ProviderSlug",
                table: "ProviderNotificationSubscriptions",
                columns: new[] { "UserEmail", "ProviderSlug" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProviderNotificationSubscriptions");
        }
    }
}
