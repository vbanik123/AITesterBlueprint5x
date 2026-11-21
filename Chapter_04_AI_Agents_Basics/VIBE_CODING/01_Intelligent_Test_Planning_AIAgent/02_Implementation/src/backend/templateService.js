// templateService.js - Test Plan Template and RICEPOT Prompt Engineering

const TEST_PLAN_TEMPLATE = `# Test Plan — <JIRA-KEY>: <title>

> Status: **DRAFT — pending human review.** Not approved until a QA owner signs off.

## 1. Scope & Objectives
- **In scope:**
- **Out of scope:**
- **Objective:** what "tested" means for this ticket.

## 2. Gaps & Questions for the author
| # | Area | Finding (⚠️/❌) | Question to author |
|---|------|----------------|--------------------|
| 1 |      |                |                    |

## 3. Test Scenarios
| ID | Priority | Type (pos/neg/boundary) | Scenario | Maps to (AC / gap) |
|----|----------|-------------------------|----------|--------------------|
| TS-1 | P0 |                       |          |                    |

## 4. Test Data & Environment
- **Data:**
- **Environment / flags:**
- **Roles / permissions:**

## 5. Risks & Assumptions
- **Assumptions made:**
- **Risks:**

## 6. Entry / Exit criteria
- **Entry:**
- **Exit:**

## 7. Resource Allocation

## 8. Timelines, Sprint Details


---
## HUMAN REVIEW GATE
- **I assumed:** …
- **I could not confirm:** …
- **Open questions blocking sign-off:** …
- **Approve, or edit, before I write test cases / automation.**`;

function buildRicepotPrompt(jiraIssue) {
  return `### R — Role
Act as an expert QA automation architect and senior test lead. You are creating a professional functional test plan for a Jira issue using the approved Test Plan Template.

### I — Instructions
1. Review the Jira Issue data provided in Context.
2. Generate a comprehensive test plan following the exact section headers, order, and structure of the supplied Test Plan Template.
3. Every factual claim about application behavior must be traceable to the retrieved Jira content.
4. If information is missing, unclear, or unspecified in the Jira issue (e.g. environment, browser support, specific error copy, timelines), respond exactly with: "Insufficient information to determine."
5. If a detail is inferred, label it exactly: "Inference (low confidence)".
6. Do NOT invent features, APIs, error messages, password policies, or system behavior.
7. Separate verified requirements from proposed test scenarios.
8. Complete the HUMAN REVIEW GATE at the bottom with all assumptions and unconfirmed items.

### C — Context
Jira Issue Key: ${jiraIssue.key}
Summary: ${jiraIssue.summary}
Issue Type: ${jiraIssue.issueType}
Priority: ${jiraIssue.priority}
Status: ${jiraIssue.status}
Components: ${(jiraIssue.components || []).join(', ') || 'Insufficient information to determine.'}
Description & Requirements:
${jiraIssue.description}
${jiraIssue.acceptanceCriteria ? `\nAcceptance Criteria:\n${jiraIssue.acceptanceCriteria}` : ''}

Approved Template to follow exactly:
${TEST_PLAN_TEMPLATE}

### P — Parameters
- Deterministic, professional, markdown format.
- Exactly match the 8 sections and the HUMAN REVIEW GATE in the template.
- Do not output preamble or commentary. Begin directly with "# Test Plan — ${jiraIssue.key}: ${jiraIssue.summary}".
`;
}

function generateDeterministicPlan(jiraIssue) {
  const key = jiraIssue.key;
  const title = jiraIssue.summary;
  const desc = jiraIssue.description || '';
  const hasDesc = desc && desc.length > 15;

  return `# Test Plan — ${key}: ${title}

> Status: **DRAFT — pending human review.** Not approved until a QA owner signs off.

## 1. Scope & Objectives
- **In scope:** 
  - Functional verification of ${title} as specified in Jira ticket ${key}.
  - Validation of user acceptance criteria and expected outcomes based on documented requirements.
  - Positive, negative, and boundary test scenarios directly derivable from ticket description.
- **Out of scope:** 
  - Performance, stress, and load testing (Insufficient information to determine).
  - Third-party SSO and security penetration testing unless explicitly mandated.
  - Localization and accessibility compliance (Insufficient information to determine).
- **Objective:** What "tested" means for this ticket:
  - Verified that all explicit requirements in ${key} execute successfully without regressions.
  - Documented edge cases, input validation, and boundary conditions fail safely with proper messaging.

## 2. Gaps & Questions for the author
| # | Area | Finding (⚠️/❌) | Question to author |
|---|------|----------------|--------------------|
| 1 | Validation Messages | ⚠️ Validation error copy not fully specified | What exact error messages should be displayed on invalid input? |
| 2 | Target Environment | ⚠️ Test environment details omitted | Which QA/staging environment, build, and browser matrix should be targeted? |
| 3 | Permissions / Roles | ⚠️ User permissions not documented | Are there specific user roles or permission gates required for this feature? |

## 3. Test Scenarios
| ID | Priority | Type (pos/neg/boundary) | Scenario | Maps to (AC / gap) |
|----|----------|-------------------------|----------|--------------------|
| TS-1 | P0 | Positive | Verify successful execution of ${title} with valid standard inputs | AC-1 / Main Flow |
| TS-2 | P0 | Negative | Verify appropriate rejection and handling when invalid data or credentials are supplied | AC-2 / Rejection |
| TS-3 | P1 | Boundary | Verify behavior when mandatory fields are left blank or contain whitespace | AC-3 / Mandatory Fields |
| TS-4 | P1 | Boundary | Verify maximum and minimum character length limits on all input fields | Gap #1 / Boundary |
| TS-5 | P2 | Negative | Verify system recovery and session stability on network interruption or timeout | Gap #2 / Resilience |

## 4. Test Data & Environment
- **Data:** Valid registered test credentials and invalid test datasets. Specific test data requirements: Insufficient information to determine.
- **Environment / flags:** Staging / QA environment. Specific URL and feature flags: Insufficient information to determine.
- **Roles / permissions:** Standard authenticated user role. Special privileges: Insufficient information to determine.

## 5. Risks & Assumptions
- **Assumptions made:** 
  - Assumed standard client-side validation prevents submission of empty mandatory fields. (Inference (low confidence))
  - Assumed backend APIs enforce identical authorization and validation rules as the frontend. (Inference (low confidence))
- **Risks:** 
  - Missing exact error message copy may lead to ambiguous defect reporting.
  - Unspecified edge cases could cause unexpected production behavior.

## 6. Entry / Exit criteria
- **Entry:** 
  - Feature deployed to designated QA test environment.
  - Test data and active credentials provisioned.
  - Smoke test passes for the primary user flow.
- **Exit:** 
  - 100% of P0 and P1 test scenarios executed.
  - Zero open Critical (P0) or Major (P1) defects.
  - QA sign-off recorded.

## 7. Resource Allocation
- Insufficient information to determine. (Assigned QA Engineer: Pending sprint assignment)

## 8. Timelines, Sprint Details
- Insufficient information to determine. (Target Sprint / Release: Subject to engineering schedule)


---
## HUMAN REVIEW GATE
- **I assumed:** Standard web application security and input validation behavior for missing requirements.
- **I could not confirm:** Exact validation text copy, target browser versions, and feature flag names.
- **Open questions blocking sign-off:** Please review the questions in Section 2 (Gaps & Questions for author).
- **Approve, or edit, before I write test cases / automation.**`;
}

module.exports = {
  TEST_PLAN_TEMPLATE,
  buildRicepotPrompt,
  generateDeterministicPlan
};
