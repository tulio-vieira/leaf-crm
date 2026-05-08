using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class addinsuranceauthmonitors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NotifyExpired",
                table: "InsuranceAuthorizationSnapshots",
                newName: "MonitorExpired");

            migrationBuilder.RenameColumn(
                name: "NotifyAboutToExpire",
                table: "InsuranceAuthorizationSnapshots",
                newName: "MonitorAboutToExpire");

            migrationBuilder.RenameColumn(
                name: "NotifyAboutToBeFull",
                table: "InsuranceAuthorizationSnapshots",
                newName: "MonitorAboutToBeFull");

            migrationBuilder.RenameColumn(
                name: "NotifyExpired",
                table: "InsuranceAuthorizations",
                newName: "MonitorExpired");

            migrationBuilder.RenameColumn(
                name: "NotifyAboutToExpire",
                table: "InsuranceAuthorizations",
                newName: "MonitorAboutToExpire");

            migrationBuilder.RenameColumn(
                name: "NotifyAboutToBeFull",
                table: "InsuranceAuthorizations",
                newName: "MonitorAboutToBeFull");

            migrationBuilder.AddColumn<bool>(
                name: "AboutToBeFull",
                table: "InsuranceAuthorizations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AboutToExpire",
                table: "InsuranceAuthorizations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Expired",
                table: "InsuranceAuthorizations",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AboutToBeFull",
                table: "InsuranceAuthorizations");

            migrationBuilder.DropColumn(
                name: "AboutToExpire",
                table: "InsuranceAuthorizations");

            migrationBuilder.DropColumn(
                name: "Expired",
                table: "InsuranceAuthorizations");

            migrationBuilder.RenameColumn(
                name: "MonitorExpired",
                table: "InsuranceAuthorizationSnapshots",
                newName: "NotifyExpired");

            migrationBuilder.RenameColumn(
                name: "MonitorAboutToExpire",
                table: "InsuranceAuthorizationSnapshots",
                newName: "NotifyAboutToExpire");

            migrationBuilder.RenameColumn(
                name: "MonitorAboutToBeFull",
                table: "InsuranceAuthorizationSnapshots",
                newName: "NotifyAboutToBeFull");

            migrationBuilder.RenameColumn(
                name: "MonitorExpired",
                table: "InsuranceAuthorizations",
                newName: "NotifyExpired");

            migrationBuilder.RenameColumn(
                name: "MonitorAboutToExpire",
                table: "InsuranceAuthorizations",
                newName: "NotifyAboutToExpire");

            migrationBuilder.RenameColumn(
                name: "MonitorAboutToBeFull",
                table: "InsuranceAuthorizations",
                newName: "NotifyAboutToBeFull");
        }
    }
}
