# Architecture

SecureStack AI is a monorepo with a React/TypeScript frontend and Java 21 Spring Boot backend. The backend exposes REST endpoints, validates untrusted files, runs rule classes, scores risk, invokes an AI provider abstraction, persists scan metadata/findings in H2 locally, and generates PDF reports.

## Sequence
```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend API
  participant R as Rule Engine
  participant A as Mock AI Provider
  participant P as PDF Generator
  U->>F: Paste/upload files
  F->>B: POST /api/scans
  B->>B: Validate file count/type/size
  B->>R: Analyze normalized files
  R-->>B: Findings
  B->>A: Summary request
  A-->>B: Executive summary/remediation
  B->>P: Generate report on demand
  B-->>F: Scan result
```

## Data model
Scan, finding, severity, category, confidence, status, and risk level are represented as typed Java domain objects and DTOs.
