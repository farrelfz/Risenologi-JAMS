# ADR-0001: Architecture Decision Record Template

## Purpose
Provide the standard template for documenting durable architecture decisions in Risenologi JAMS.

## Scope
Applies to architecture decisions that affect system structure, quality attributes, data design, security posture, deployment strategy, integration boundaries, or long-term maintainability.

## Status
Template.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [1. Decision Summary](#1-decision-summary)
- [2. Context](#2-context)
- [3. Decision Drivers](#3-decision-drivers)
- [4. Decision](#4-decision)
- [5. Consequences](#5-consequences)
- [6. Alternatives Considered](#6-alternatives-considered)
- [7. Security and Privacy Impact](#7-security-and-privacy-impact)
- [8. Operational Impact](#8-operational-impact)
- [9. Compliance with Constitution](#9-compliance-with-constitution)
- [10. Review and Approval](#10-review-and-approval)
- [11. Revision History](#11-revision-history)
- [12. TODO](#12-todo)

## 1. Decision Summary
Summarize the decision in one or two paragraphs. The summary SHALL be understandable without reading implementation code.

| Field | Value |
| --- | --- |
| ADR ID | ADR-NNNN |
| Title | TBD |
| Status | Proposed, Accepted, Superseded, Deprecated, or Rejected |
| Date | YYYY-MM-DD |
| Owner | TBD |
| Related RFCs | TBD |
| Related PRs | TBD |

## 2. Context
Describe the problem, constraints, product requirements, architectural forces, and assumptions that make this decision necessary.

The context SHOULD explain why the decision is needed now and what risks exist if no decision is made.

## 3. Decision Drivers
List the principles, requirements, and constraints that influenced the decision.

Examples:
- Product reliability and auditability.
- Security and privacy obligations.
- Maintainability and operational simplicity.
- Scalability and performance expectations.
- Alignment with approved PRD, architecture, security, and deployment documents.

## 4. Decision
State the decision clearly using RFC-style language.

The decision SHALL describe what is approved. It SHOULD also identify any explicit constraints or boundaries. It SHALL NOT introduce unrelated product behavior, database schema, API contracts, or UI flows unless those items are approved in the relevant source documents.

## 5. Consequences
Describe expected outcomes.

| Type | Consequence |
| --- | --- |
| Positive | TBD |
| Negative | TBD |
| Neutral | TBD |

## 6. Alternatives Considered
Document meaningful alternatives and why they were not selected.

| Alternative | Reason Not Selected |
| --- | --- |
| TBD | TBD |

## 7. Security and Privacy Impact
Describe effects on authentication, authorization, data protection, auditability, secrets, privacy, and abuse prevention.

If there is no security or privacy impact, the ADR SHALL state why.

## 8. Operational Impact
Describe effects on deployment, monitoring, observability, rollback, support, migration, data retention, and incident response.

If there is no operational impact, the ADR SHALL state why.

## 9. Compliance with Constitution
Explain how the decision complies with the Engineering Constitution and related governance documents.

The ADR SHALL identify any constitutional principle that shaped the decision.

## 10. Review and Approval
List required reviewers, approvers, and review evidence.

| Role | Name | Approval Status | Date |
| --- | --- | --- | --- |
| Owner | TBD | Pending | TBD |
| Reviewer | TBD | Pending | TBD |

## 11. Revision History
| Date | Author | Change |
| --- | --- | --- |
| 2026-07-26 | AI Engineering Agent | Created ADR template. |

## 12. TODO
- Replace all `TBD` placeholders before proposing a real ADR.
- Assign an owner and reviewers.
- Link related RFCs, requirements, and pull requests.
