using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeafAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixPositionCollation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP INDEX IF EXISTS ""IX_Leads_BoardId_ColumnIdx_Position"";
                ALTER TABLE ""Leads"" DROP COLUMN IF EXISTS ""Position"";
                ALTER TABLE ""Leads"" ADD COLUMN ""Position"" text COLLATE ""C"" NOT NULL DEFAULT 'a0';
                WITH ranked AS (
                    SELECT ""Id"",
                           'a' || (ROW_NUMBER() OVER (PARTITION BY ""BoardId"", ""ColumnIdx"" ORDER BY ""Id"") - 1)::text AS pos
                    FROM ""Leads""
                )
                UPDATE ""Leads"" l SET ""Position"" = ranked.pos FROM ranked WHERE l.""Id"" = ranked.""Id"";
                ALTER TABLE ""Leads"" ALTER COLUMN ""Position"" DROP DEFAULT;
                CREATE INDEX ""IX_Leads_BoardId_ColumnIdx_Position"" ON ""Leads"" (""BoardId"", ""ColumnIdx"", ""Position"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP INDEX IF EXISTS ""IX_Leads_BoardId_ColumnIdx_Position"";
                ALTER TABLE ""Leads"" DROP COLUMN IF EXISTS ""Position"";
                ALTER TABLE ""Leads"" ADD COLUMN ""Position"" text NOT NULL DEFAULT 'a0';
                WITH ranked AS (
                    SELECT ""Id"",
                           'a' || (ROW_NUMBER() OVER (PARTITION BY ""BoardId"", ""ColumnIdx"" ORDER BY ""Id"") - 1)::text AS pos
                    FROM ""Leads""
                )
                UPDATE ""Leads"" l SET ""Position"" = ranked.pos FROM ranked WHERE l.""Id"" = ranked.""Id"";
                ALTER TABLE ""Leads"" ALTER COLUMN ""Position"" DROP DEFAULT;
                CREATE INDEX ""IX_Leads_BoardId_ColumnIdx_Position"" ON ""Leads"" (""BoardId"", ""ColumnIdx"", ""Position"");
            ");
        }
    }
}
