using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bitacora.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTripFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Trips",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsInternational",
                table: "Trips",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "IsInternational",
                table: "Trips");
        }
    }
}
