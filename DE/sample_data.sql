-- Demonstration records for a disposable/local database.
-- These IDs make the examples in queries.sql reproducible.
-- Do not use the demonstration password hash for a real account.

INSERT INTO "User" ("id", "name", "email", "password", "role") VALUES
('00000000-0000-0000-0000-000000000001', 'Asha Mehta', 'asha@example.test', '$2b$10$demonstration-hash-not-for-production', 'ADMIN'),
('00000000-0000-0000-0000-000000000002', 'Ravi Kumar', 'ravi@example.test', '$2b$10$demonstration-hash-not-for-production', 'RESEARCHER'),
('00000000-0000-0000-0000-000000000003', 'Neha Singh', 'neha@example.test', '$2b$10$demonstration-hash-not-for-production', 'RESEARCHER');

INSERT INTO "Project" ("id", "title", "projectCode", "description", "fundingType", "budget", "startDate", "endDate", "status") VALUES
('10000000-0000-0000-0000-000000000001', 'Mine Safety Sensor Network', 'ST-2026-001', 'Real-time underground monitoring sensors', 'ST', 1200000, '2026-01-01', '2027-12-31', 'APPROVED'),
('10000000-0000-0000-0000-000000000002', 'Coal Waste Recovery Study', 'RD-2026-002', 'Research into recovery of usable material', 'RD', 850000, '2026-04-01', '2027-03-31', 'PENDING'),
('10000000-0000-0000-0000-000000000003', 'Emission Reduction Pilot', 'RD-2025-003', 'Pilot process for reducing emissions', 'RD', 1500000, '2025-01-01', '2026-12-31', 'COMPLETED');

INSERT INTO "_ProjectResearchers" ("A", "B") VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002');

INSERT INTO "Report" ("id", "title", "quarter", "year", "progress", "completedWork", "remarks", "status", "projectId", "researcherId") VALUES
('20000000-0000-0000-0000-000000000001', 'Sensor network Q1 update', 1, 2026, 35, 'Installed and calibrated 12 sensors.', NULL, 'PENDING', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
('20000000-0000-0000-0000-000000000002', 'Emission pilot Q4 update', 4, 2025, 100, 'Completed pilot measurements and final analysis.', 'Approved after review.', 'APPROVED', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002');

INSERT INTO "FundReport" ("id", "amountSpent", "amountReceived", "quarter", "year", "projectId") VALUES
('30000000-0000-0000-0000-000000000001', 250000, 400000, 1, 2026, '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', 150000, 250000, 2, 2026, '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000003', 700000, 1000000, 4, 2025, '10000000-0000-0000-0000-000000000003');

INSERT INTO "Document" ("id", "name", "fileUrl", "projectId") VALUES
('40000000-0000-0000-0000-000000000001', 'Sensor project sanction letter', 'https://example.test/docs/st-2026-001-sanction.pdf', '10000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000002', 'Emission pilot final report', 'https://example.test/docs/rd-2025-003-final.pdf', '10000000-0000-0000-0000-000000000003');
