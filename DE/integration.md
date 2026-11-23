# Database and Backend Integration

## Architecture

The backend uses the Prisma ORM with the PostgreSQL provider. The database
connection is created in `server/src/config/config.js` using the
`DATABASE_URL` environment variable. Services call Prisma models, and
controllers expose those operations through authenticated Express routes.

The request flow is:

```text
React client
    -> Express route/controller
    -> service layer
    -> Prisma Client
    -> PostgreSQL
```

The client and server were read only while preparing this submission; no
application files were changed.

## Evidence from implemented operations

| Feature | Backend operation | Database effect |
| --- | --- | --- |
| Register project | `prisma.project.create` | Inserts a `Project` row |
| Edit project | `prisma.project.update` | Updates project fields |
| Assign researcher | `project.update` with `researchers.connect` | Inserts a join-table row |
| Remove researcher | `project.update` with `researchers.disconnect` | Deletes a join-table row |
| Submit progress | `prisma.report.create` | Inserts a `Report` row |
| Review progress | `prisma.report.update` | Updates report status and remarks |
| Submit funding | `prisma.fundReport.create` | Inserts a `FundReport` row |
| Manage documents | `prisma.document.create/delete` | Inserts or deletes `Document` rows |
| Admin dashboard | `project.findMany` and `report.count` | Reads joined project, report and funding data |

The report and fund-report services check the project assignment before
inserting data. The compound unique constraints prevent a researcher from
submitting two records for the same project, quarter and year.

## Integrity and validation

- Primary keys identify every record.
- Unique constraints protect user emails and project codes.
- Foreign keys prevent orphaned reports, fund reports and documents.
- Join-table keys prevent duplicate researcher assignments.
- Enum values restrict roles, funding types and statuses.
- Service validation restricts researcher access to assigned projects.
- Project status transitions are validated by the service layer.

## Performance and scalability

The unique indexes on `User.email`, `Project.projectCode`,
`Report(projectId, quarter, year)` and `FundReport(projectId, quarter, year)`
support common lookups and duplicate checks. The generated index on the
assignment table's user column supports finding all projects for a researcher.
Additional indexes can be added later for high-volume filtering by report year,
status or project status after measuring query plans.

For production, the connection string must remain in an environment variable,
passwords must remain one-way bcrypt hashes, and backups, migration review and
least-privilege database credentials should be used.
