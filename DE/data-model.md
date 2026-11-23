# Data Model and ER Diagram

## Entities and key attributes

| Entity | Primary key | Important attributes |
| --- | --- | --- |
| `User` | `id` | `name`, unique `email`, `role`, `password` |
| `Project` | `id` | unique `projectCode`, `title`, `fundingType`, `budget`, `status`, dates |
| `Report` | `id` | `projectId`, `researcherId`, `quarter`, `year`, `progress`, `status` |
| `FundReport` | `id` | `projectId`, `quarter`, `year`, `amountReceived`, `amountSpent` |
| `Document` | `id` | `projectId`, `name`, `fileUrl`, `createdAt` |
| `_ProjectResearchers` | (`A`, `B`) | join table linking project `A` to user `B` |

## Relationships

- One `Project` has many `Report` records.
- One `User` can submit many `Report` records.
- One `Project` has many `FundReport` records.
- One `Project` has many `Document` records.
- `Project` and `User` have a many-to-many relationship through
  `_ProjectResearchers`.
- A project and its reporting period are unique for both progress and fund
  reports (`projectId, quarter, year`).

## ER diagram

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string email UK
        string password
        Role role
    }
    PROJECT {
        string id PK
        string title
        string projectCode UK
        string description
        FundingType fundingType
        float budget
        datetime startDate
        datetime endDate
        Status status
    }
    REPORT {
        string id PK
        string projectId FK
        string researcherId FK
        int quarter
        int year
        int progress
        string completedWork
        string remarks
        Status status
        datetime createdAt
    }
    FUND_REPORT {
        string id PK
        string projectId FK
        int quarter
        int year
        float amountReceived
        float amountSpent
    }
    DOCUMENT {
        string id PK
        string projectId FK
        string name
        string fileUrl
        datetime createdAt
    }
    PROJECT_RESEARCHER {
        string projectId PK, FK
        string userId PK, FK
    }

    PROJECT ||--o{ REPORT : contains
    USER ||--o{ REPORT : submits
    PROJECT ||--o{ FUND_REPORT : records
    PROJECT ||--o{ DOCUMENT : stores
    PROJECT ||--o{ PROJECT_RESEARCHER : has
    USER ||--o{ PROJECT_RESEARCHER : assigned
```
