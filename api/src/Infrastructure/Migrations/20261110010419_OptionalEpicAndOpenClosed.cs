using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OptionalEpicAndOpenClosed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Epics_EpicId",
                table: "Tickets");

            migrationBuilder.AlterColumn<int>(
                name: "EpicId",
                table: "Tickets",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Epics_EpicId",
                table: "Tickets",
                column: "EpicId",
                principalTable: "Epics",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Epics go from backlog (0) / active (1) / closed (2) to open (0) / closed (1). Written
            // by hand: EF only sees an integer column and would leave the old values in place.
            migrationBuilder.Sql("""UPDATE "Epics" SET "Status" = CASE WHEN "Status" = 2 THEN 1 ELSE 0 END;""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Open epics come back as active (there is no telling which were backlog).
            migrationBuilder.Sql("""UPDATE "Epics" SET "Status" = CASE WHEN "Status" = 1 THEN 2 ELSE 1 END;""");

            // The old schema has no room for a ticket without an epic: going back deletes them. A
            // child always shares its parent's epic, so whole families go together.
            migrationBuilder.Sql("""DELETE FROM "Tickets" WHERE "EpicId" IS NULL;""");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Epics_EpicId",
                table: "Tickets");

            migrationBuilder.AlterColumn<int>(
                name: "EpicId",
                table: "Tickets",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Epics_EpicId",
                table: "Tickets",
                column: "EpicId",
                principalTable: "Epics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
