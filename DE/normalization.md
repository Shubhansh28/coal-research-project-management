# Database Normalization

## Functional dependencies

The principal dependencies are:

- `User.id -> name, email, password, role`
- `User.email -> id, name, password, role`
- `Project.id -> title, projectCode, description, fundingType, budget, dates, status`
- `Project.projectCode -> id, title, description, fundingType, budget, dates, status`
- `(Project.id, Report.quarter, Report.year) -> Report.id, progress, completedWork, remarks, status, researcherId, createdAt`
- `(Project.id, FundReport.quarter, FundReport.year) -> FundReport.id, amountReceived, amountSpent`
- `Document.id -> name, fileUrl, projectId, createdAt`
- `(Project.id, User.id) -> assignment`

## First Normal Form (1NF)

The design is in 1NF because every column stores one atomic value. For
example, a project does not store a comma-separated list of researchers or
documents. Each report is one row and each document is one row. Repeating
quarterly values are represented by separate rows identified by a project,
quarter and year.

## Second Normal Form (2NF)

All non-key attributes depend on the complete key:

- Tables with a single-column primary key (`User`, `Project`, `Report`,
  `FundReport`, `Document`) have no partial dependency.
- The assignment table has a composite key (`projectId`, `userId`) and has no
  non-key attributes, so partial dependency cannot occur.
- The quarterly uniqueness constraints identify one reporting record for a
  project and period; report details depend on that complete business key.

## Third Normal Form (3NF)

There are no transitive dependencies in the final tables:

- researcher details are stored once in `User`, not copied into `Report`;
- project details are stored once in `Project`, not copied into reports,
  documents or fund reports;
- funding type, role and status are controlled values rather than repeated
  descriptive text;
- the many-to-many relationship is separated into
  `_ProjectResearchers`.

This separation prevents update anomalies. Changing a user's name requires one
`User` update, deleting a document does not delete its project, and a quarterly
report can be reviewed without changing project master data.

## Result

The resulting schema satisfies 3NF for the operational attributes while
retaining the join table required for the many-to-many assignment. The
dashboard calculates totals from related fund-report rows instead of storing
duplicated totals on `Project`.
