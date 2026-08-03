using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bitacora.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTripBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Budget",
                table: "Trips",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Budget",
                table: "Trips");
        }
    }
}
