using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LogosAPI.Migrations
{
    /// <inheritdoc />
    public partial class changenotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcknowledgedByUserId",
                table: "Notifications");

            migrationBuilder.AddColumn<string>(
                name: "AcknowledgedByUserEmail",
                table: "Notifications",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcknowledgedByUserEmail",
                table: "Notifications");

            migrationBuilder.AddColumn<Guid>(
                name: "AcknowledgedByUserId",
                table: "Notifications",
                type: "uuid",
                nullable: true);
        }
    }
}
