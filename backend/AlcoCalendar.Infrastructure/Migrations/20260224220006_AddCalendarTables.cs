using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlcoCalendar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCalendarTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "consumption_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    drink_type_id = table.Column<int>(type: "integer", nullable: false),
                    volume_ml = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    time = table.Column<TimeOnly>(type: "time without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_consumption_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "day_summaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_day_summaries", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_consumption_events_user_id_date",
                table: "consumption_events",
                columns: new[] { "user_id", "date" });

            migrationBuilder.CreateIndex(
                name: "IX_day_summaries_user_id_date",
                table: "day_summaries",
                columns: new[] { "user_id", "date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "consumption_events");

            migrationBuilder.DropTable(
                name: "day_summaries");
        }
    }
}
