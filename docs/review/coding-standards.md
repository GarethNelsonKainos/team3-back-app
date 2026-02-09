Project Delivery Ruleset

1. Source Control & Branching
Main branch must be protected — no direct pushes permitted.
All work must go through a Pull Request (PR).
Feature work must occur on dedicated branches tied to Jira/ADO tickets.
PRs are required for all tickets before the ticket can move to In Review.

2. Pull Request Workflow & Reviews
Every PR must be reviewed and approved by at least one peer developer.
Tech Lead (Mentor) approval is mandatory before merge.
All discussions, requested changes, and final approvals must be tracked within the PR.

3. Quality Gates (Automated Checks)
All checks must pass before merging into main:

Testing
Unit/integration tests must run automatically on each PR.
All tests must pass—no flaky or intermittently failing tests are acceptable.
After merge, tests must also run and pass on the main branch CI pipeline.

Linting
Code must pass project‑defined lint rules.

Security & Compliance
No usernames, passwords, API keys, or secrets may appear in the source code.
Sensitive data must not appear in URLs (query params, paths).
All input must undergo systematic validation (both client and server side).

4. Architecture & System Design
Web application must not communicate directly with the database.
System design must support database recreation in the event of outage, meaning:
repeatable schema migrations,
deterministic seed data or migration scripts,
documented recovery steps.

5. Environment & Developer Experience
The application should be runnable on every developer’s machine.