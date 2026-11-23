# Database Selection and Justification

## Selected database: PostgreSQL

PostgreSQL is appropriate for this system because the application stores
structured, related data with strong consistency requirements:

- users have roles and unique email addresses;
- projects have unique project codes, budgets and controlled status values;
- reports and fund reports belong to a project and a reporting period;
- researchers can be assigned to many projects and projects can have many
  researchers;
- documents belong to a project;
- duplicate quarterly submissions must be prevented.

These requirements are naturally represented using relational tables, primary
keys and foreign keys. PostgreSQL also provides transactions, constraints,
joins, grouping and indexing for the administrative dashboard and reporting
features.

MongoDB could store the project documents, but embedding reports, funding
records and researchers would create large, frequently changing documents.
Referencing those values would recreate relational joins without providing a
benefit for this workload. PostgreSQL therefore gives the project a clearer
normalized model and better enforcement of referential integrity.

## Nature of the data

The data is mostly structured operational data:

1. **Identity data:** users, email addresses and roles.
2. **Master data:** projects, funding type, budget and lifecycle status.
3. **Transactional data:** quarterly progress reports and fund reports.
4. **Reference data:** documents linked to projects.
5. **Relationship data:** project-to-researcher assignments.

Amounts are stored as numeric database values, dates as timestamps, and
controlled categories as PostgreSQL enums. Text fields hold descriptions,
completed work, remarks and document URLs.
