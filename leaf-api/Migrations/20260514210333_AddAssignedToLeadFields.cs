using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeafAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedToLeadFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ChangedBy",
                table: "Leads",
                newName: "ChangedByUserName");

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedToUserGuid",
                table: "Leads",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedToUserName",
                table: "Leads",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ChangedByUserGuid",
                table: "Leads",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedToUserGuid",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "AssignedToUserName",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "ChangedByUserGuid",
                table: "Leads");

            migrationBuilder.RenameColumn(
                name: "ChangedByUserName",
                table: "Leads",
                newName: "ChangedBy");
        }
    }
}
