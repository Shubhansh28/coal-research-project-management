-- Project-specific PostgreSQL operations.
-- Run after the application migration and sample_data.sql.

-- 1. INSERT: register a new project.
INSERT INTO "Project" ("id", "title", "projectCode", "fundingType", "budget")
VALUES ('10000000-0000-0000-0000-000000000004', 'Ventilation Efficiency Trial',
        'ST-2026-004', 'ST', 600000);
-- Expected: INSERT 0 1

-- 2. UPDATE: approve a project after administrative review.
UPDATE "Project" SET "status" = 'APPROVED'
WHERE "projectCode" = 'ST-2026-004';
-- Expected: UPDATE 1

-- 3. SELECT with filtering and sorting: show active projects by budget.
SELECT "projectCode", "title", "budget"
FROM "Project"
WHERE "status" IN ('PENDING', 'APPROVED')
ORDER BY "budget" DESC;
-- Expected sample order: RD-2026-002, ST-2026-001, ST-2026-004

-- 4. JOIN: show reports with the project and submitting researcher.
SELECT r."title" AS report, p."projectCode", u."name" AS researcher,
       r."progress", r."status"
FROM "Report" r
JOIN "Project" p ON p."id" = r."projectId"
JOIN "User" u ON u."id" = r."researcherId"
ORDER BY r."year" DESC, r."quarter" DESC;
-- Expected: two report rows with project codes and researcher names.

-- 5. Aggregate: calculate total received and spent per project.
SELECT p."projectCode",
       COALESCE(SUM(f."amountReceived"), 0) AS total_received,
       COALESCE(SUM(f."amountSpent"), 0) AS total_spent
FROM "Project" p
LEFT JOIN "FundReport" f ON f."projectId" = p."id"
GROUP BY p."id", p."projectCode"
ORDER BY p."projectCode";
-- Expected: ST-2026-001 = 650000 received / 400000 spent.

-- 6. GROUP BY and HAVING: find projects with more than 500000 spent.
SELECT p."projectCode", SUM(f."amountSpent") AS total_spent
FROM "Project" p
JOIN "FundReport" f ON f."projectId" = p."id"
GROUP BY p."id", p."projectCode"
HAVING SUM(f."amountSpent") > 500000;
-- Expected: RD-2025-003.

-- 7. Subquery: projects that have at least one pending report.
SELECT "projectCode", "title"
FROM "Project" p
WHERE EXISTS (
    SELECT 1 FROM "Report" r
    WHERE r."projectId" = p."id" AND r."status" = 'PENDING'
);
-- Expected: ST-2026-001.

-- 8. Many-to-many JOIN: list each project assignment.
SELECT p."projectCode", u."name", u."email"
FROM "Project" p
JOIN "_ProjectResearchers" pr ON pr."A" = p."id"
JOIN "User" u ON u."id" = pr."B"
ORDER BY p."projectCode", u."name";
-- Expected: three assignment rows.

-- 9. UPDATE: review a pending report.
UPDATE "Report"
SET "status" = 'APPROVED', "remarks" = 'Evidence checked by administrator.'
WHERE "id" = '20000000-0000-0000-0000-000000000001'
  AND "status" = 'PENDING';
-- Expected: UPDATE 1

-- 10. DELETE: remove a document by its identifier.
DELETE FROM "Document"
WHERE "id" = '40000000-0000-0000-0000-000000000002';
-- Expected: DELETE 1

-- 11. Dashboard KPI: count projects by lifecycle status.
SELECT "status", COUNT(*) AS project_count
FROM "Project"
GROUP BY "status"
ORDER BY "status";
-- Expected sample counts after query 2: APPROVED 2, COMPLETED 1, PENDING 1.

-- 12. Data-integrity check: find overspent projects.
SELECT p."projectCode", p."budget",
       COALESCE(SUM(f."amountSpent"), 0) AS total_spent
FROM "Project" p
LEFT JOIN "FundReport" f ON f."projectId" = p."id"
GROUP BY p."id", p."projectCode", p."budget"
HAVING COALESCE(SUM(f."amountSpent"), 0) > p."budget";
-- Expected: zero rows for the sample data.
