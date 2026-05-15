using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeafAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadCreatedBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserGuid",
                table: "Leads",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserName",
                table: "Leads",
                type: "character varying(60)",
                maxLength: 60,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserGuid",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "CreatedByUserName",
                table: "Leads");
        }
    }
}
