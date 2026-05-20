using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeafAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerNameToLead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Leads");

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Leads",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "Leads");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Leads",
                type: "character varying(60)",
                maxLength: 60,
                nullable: false,
                defaultValue: "");
        }
    }
}
