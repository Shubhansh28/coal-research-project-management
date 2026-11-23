# Database Engineering (DE) Submission

## Coal Research Project Monitoring System

This folder documents the PostgreSQL database used by the Coal Research Project
Monitoring System. The database is not a separate prototype: it is the schema
used by the existing Prisma backend.

## Contents

| File | Deliverable |
| --- | --- |
| [database-selection.md](./database-selection.md) | Database selection and justification |
| [data-model.md](./data-model.md) | Entities, attributes, relationships and ER diagram |
| [normalization.md](./normalization.md) | Functional dependencies and 1NF, 2NF and 3NF |
| [schema.sql](./schema.sql) | Final PostgreSQL schema reference |
| [sample_data.sql](./sample_data.sql) | Safe demonstration records |
| [queries.sql](./queries.sql) | 12 project-specific SQL operations and expected outputs |
| [integration.md](./integration.md) | Database-backend integration evidence and architecture |

## Project context

The application monitors Science & Technology (S&T) and Research & Development
(R&D) coal-sector projects. Administrators manage projects, budgets, users and
reviews. Researchers submit quarterly progress reports, fund utilization
reports and project documents.

## Implementation note

The application schema is maintained in `server/prisma/schema.prisma` and is
applied through the Prisma migration in
`server/prisma/migrations/20261111074927_init/migration.sql`. The SQL files in
this folder are submission documentation and demonstration scripts; they do
not modify the application schema.

Sample query outputs are labelled as expected outputs because they depend on
the records present in the evaluator's database. Run the scripts against a
local PostgreSQL database after applying the application migration and loading
the sample records.
