# Test Plan: VWO Login Module (https://app.vwo.com/)

**Document ID:** TP-VWO-LOGIN-001  
**Version:** 1.0  
**Date:** 2026-11-18  
**Status:** Draft for Review  
**Target Application:** [VWO Application Login](https://app.vwo.com/)  
**Template Reference:** `Chapter_03_Prompt_Engineering_QA/Template.md`  

---

## 1. Test Plan

### 1.1 Objective
The primary objective of this functional test plan is to verify and validate the authentication behavior of the VWO Login module (`https://app.vwo.com/`). Testing ensures that:
- Registered users can authenticate successfully with valid credentials and navigate to the dashboard.
- Authentication fails safely when invalid credentials or empty mandatory fields are submitted.
- The specified error notification is displayed accurately.
- Unspecified behaviors, constraints, and edge cases are flagged for clarification before formal sign-off.

### 1.2 Scope

#### 1.2.1 In Scope (Functional Authentication Testing)
- Functional verification of the login page at `https://app.vwo.com/`.
- Positive testing: Valid registered credentials leading to authenticated dashboard access.
- Negative testing: Invalid credentials triggering the approved error message.
- Input validation: Submission with empty mandatory fields (Email and Password).
- Dashboard landing: Verification that successful login directs the user to the authenticated dashboard view.

#### 1.2.2 Out of Scope
- Single Sign-On (SSO / SAML / Google / OAuth) integrations *(Requires clarification if supported)*.
- Multi-Factor Authentication (MFA / 2FA) *(Requires clarification if configured)*.
- Password recovery / "Forgot Password" workflows *(Requires clarification if included in this release)*.
- Self-registration / "Sign Up" links.
- Performance, load, stress, and security vulnerability / penetration testing.
- Non-functional compliance testing (accessibility/WCAG, localization).

### 1.3 Inclusions & Assumptions
- **Inclusions:** Verification across standard supported desktop browsers (Chrome, Firefox, Safari, Edge) for functional responsiveness and correctness.
- **Assumptions (Approved Requirements):**
  1. Registered users can log in with valid credentials.
  2. Invalid credentials must not grant access and give error.
  3. Email and password are mandatory fields.
  4. Successful login opens the authenticated dashboard.
  5. Invalid login gives error message: `"Your email, password, IP address or location did not match"`.
  6. Any requirements beyond the 5 points above are considered **Requires Clarification**.

### 1.4 Test Environments *(Proposed Recommendations)*
- **Staging / QA Environment:** Target test environment mirroring production (`https://app.vwo.com/` or staging equivalent).
- **Supported Browsers (Recommended):**
  - Google Chrome (Latest stable)
  - Mozilla Firefox (Latest stable)
  - Apple Safari (Latest stable)
  - Microsoft Edge (Latest stable)
- **Supported OS (Recommended):** Windows 10/11, macOS (Latest).

### 1.5 Defect Reporting Procedure
Defects identified during test execution will be logged in the designated issue tracker (e.g., Jira / GitHub Issues) following this convention:
- **Title Format:** `[VWO-Login] <Brief description of failure>`
- **Severity Levels:**
  - *Critical (P1):* Valid user cannot log in; security bypass allowing access with invalid credentials; dashboard inaccessible after valid login.
  - *Major (P2):* Incorrect or missing error message on invalid credentials; mandatory field validation failing.
  - *Minor (P3):* Cosmetic or display inconsistencies that do not block login.
- **Mandatory Defect Fields:** Steps to reproduce, test data used, expected result, actual result, screenshot/video attachment, browser & OS version.

---

## 2. Test Strategy & Approach

A black-box functional testing strategy is adopted, focusing on:
1. **Positive Functional Testing:** Verifying normal user paths using registered credentials.
2. **Negative Functional Testing:** Supplying invalid combinations (wrong password, unregistered email, mismatched location/IP if applicable) to confirm access denial and exact error presentation.
3. **Equivalence Partitioning & Boundary Value Testing:**
   - Valid inputs vs. Empty inputs for mandatory fields.
   - Field length / character sets: *Requires clarification* (no rules defined in requirements).
4. **Clarification-Driven Testing:** Tagging all behaviors lacking explicit specification (such as inline validation messaging, session timeout, account lockout) as "Requires Clarification" without making assumptions.

---

## 3. Test Schedule *(Proposed Recommendations)*

| Phase | Activity | Estimated Timeline | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Test Plan review & requirement clarification | Day 1 | In Review |
| **Phase 2** | Test data preparation (valid & test accounts) | Day 2 | Pending |
| **Phase 3** | Test execution on QA / Staging build | Day 2 - Day 3 | Pending |
| **Phase 4** | Defect retesting & regression verification | Day 4 | Pending |
| **Phase 5** | Test summary report & sign-off closure | Day 5 | Pending |

---

## 4. Test Deliverables

- **Pre-Execution:**
  - Approved Test Plan document (`TP-VWO-LOGIN-001`).
  - Traceability Matrix / Test Scenarios list.
  - Test Data preparation checklist.
- **During Execution:**
  - Defect reports logged in tracking system.
  - Daily execution status report.
- **Post-Execution:**
  - Final Test Execution Summary Report.
  - Open Clarifications and Unresolved Risks Log.

---

## 5. Test Scenarios & Cases

The following test scenarios are derived strictly from the approved requirements:

| Scenario ID | Scenario Type | Test Description | Input Data | Expected Result | Requirement Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TS_LOGIN_01** | Positive | Valid login with registered credentials | Valid registered email and valid matching password | User is authenticated and navigated to the authenticated dashboard. | Req 1, 4 |
| **TS_LOGIN_02** | Negative | Login with unregistered email | Unregistered email, arbitrary password | Access denied; user remains on login page; displays error: `"Your email, password, IP address or location did not match"`. | Req 2, 5 |
| **TS_LOGIN_03** | Negative | Login with registered email and incorrect password | Valid registered email, incorrect password | Access denied; user remains on login page; displays error: `"Your email, password, IP address or location did not match"`. | Req 2, 5 |
| **TS_LOGIN_04** | Negative | Login with empty email field | Email: `[Blank]`, Password: Valid password | Form submission blocked or rejected; login not permitted. *(Specific inline message / behavior: **Requires clarification**)* | Req 3 |
| **TS_LOGIN_05** | Negative | Login with empty password field | Email: Valid email, Password: `[Blank]` | Form submission blocked or rejected; login not permitted. *(Specific inline message / behavior: **Requires clarification**)* | Req 3 |
| **TS_LOGIN_06** | Negative | Login with both fields empty | Email: `[Blank]`, Password: `[Blank]` | Form submission blocked or rejected; login not permitted. *(Specific inline message / behavior: **Requires clarification**)* | Req 3 |
| **TS_LOGIN_07** | Boundary / Validation | Malformed email string (e.g. missing `@` or domain) | Invalid email format, any password | Access denied. *(Specific validation message / client vs. server validation: **Requires clarification**)* | Req 3, 5 *(Requires clarification)* |
| **TS_LOGIN_08** | Navigation / State | Post-login dashboard access verification | Valid registered credentials | Authenticated dashboard elements load completely; URL indicates dashboard state. | Req 4 |
| **TS_LOGIN_09** | Security / Edge | Multiple consecutive failed attempts | Valid email, wrong password repeated | Access denied with standard error. *(Account lockout / rate limiting policy: **Requires clarification**)* | Req 2, 5 *(Requires clarification)* |
| **TS_LOGIN_10** | Session / State | Direct URL access to dashboard without login | Direct browser navigation to dashboard URL | User is redirected back to login page. *(Session handling: **Requires clarification**)* | Req 4 *(Requires clarification)* |

---

## 6. Environment and Test Data

### 6.1 Test Data Requirements
| Data Type | Description | Quantity / Format | Source |
| :--- | :--- | :--- | :--- |
| **Active Valid Account** | Pre-registered account in active state with known credentials | Minimum 2 accounts | Provided by Admin / Test Environment |
| **Invalid Credentials** | Unregistered email addresses and non-matching passwords | Multiple sets | Generated test data |
| **Blank / Boundary Data** | Empty strings, whitespace characters, malformed email patterns | As specified in test scenarios | QA generated |

### 6.2 Environment Needs
- Stable network access to `https://app.vwo.com/` (or designated staging URL).
- Verified test server / database state with seeded active user profiles.

---

## 7. Entry and Exit Criteria *(Proposed Recommendations)*

### 7.1 Test Planning & Design
- **Entry Criteria:**
  - Functional requirements approved and baselined.
  - Test Plan created and circulated for stakeholder review.
- **Exit Criteria:**
  - Test Plan reviewed and signed off by QA Lead / Product Owner.
  - Test scenarios mapped to requirements.

### 7.2 Test Execution
- **Entry Criteria:**
  - Test environment deployed, accessible, and verified via smoke test.
  - Test accounts created and credentials validated.
  - Test cases and scenarios ready in test management tool.
- **Exit Criteria:**
  - 100% of approved functional test scenarios executed.
  - 100% of Critical (P1) and Major (P2) defects resolved and retested.
  - Any remaining lower-severity defects documented with agreed mitigation or deferred status.

### 7.3 Test Closure
- **Entry Criteria:**
  - All planned test executions completed.
  - All logged defects accounted for (closed, verified, or formally deferred).
- **Exit Criteria:**
  - Final Test Execution Summary Report published.
  - Formal QA Sign-off recorded for the login module.

---

## 8. Tools *(Proposed Recommendations)*

| Category | Tool | Purpose |
| :--- | :--- | :--- |
| **Defect Tracking** | Jira / Linear / GitHub Issues | Defect logging, lifecycle management, and triage |
| **Test Case Management** | TestRail / Zephyr / Markdown Repository | Test case documentation, execution tracking, and status |
| **Browsers** | Chrome, Firefox, Safari, Edge | Cross-browser execution |
| **Debugging / Network** | Chrome DevTools | Inspect network requests, API status codes, and console errors |

---

## 9. Risks, Mitigations & Open Questions

### 9.1 Risks and Mitigations
| Risk | Impact | Proposed Mitigation |
| :--- | :--- | :--- |
| Test accounts getting locked or credentials altered during testing | Medium | Maintain dedicated isolated QA accounts with automated reset capability. |
| Network latency or third-party service interruption | Low to Medium | Isolate backend authentication services in staging and monitor API uptime. |

### 9.2 Items Requiring Clarification (Strictly per Approved Requirements)

The following behaviors are **unspecified** in the requirements provided in `STAR.md` and are formally marked as **Requires Clarification**:

1. **Empty Field Validation Behavior:**
   - *Question:* Does leaving Email or Password blank trigger client-side HTML5 validation, inline error text below the fields, or a general alert? What is the exact text of the validation message for empty fields?
   - *Status:* **Requires clarification** (Requirement states only that fields are mandatory).

2. **Password Rules and Constraints:**
   - *Question:* What are the minimum/maximum length constraints, allowed special characters, or complexity rules for passwords?
   - *Status:* **Requires clarification** (No password rules specified; do not invent rules).

3. **Account Lockout & Rate Limiting Policy:**
   - *Question:* Is there an account lockout threshold after $N$ failed attempts? Is a CAPTCHA or cool-down period triggered?
   - *Status:* **Requires clarification** (No lockout policy specified).

4. **Session Timeout and Expiry:**
   - *Question:* What is the active session idle timeout duration once logged into the dashboard? Does token refresh occur automatically?
   - *Status:* **Requires clarification** (No session durations specified).

5. **Location / IP Address Mismatch Error Trigger:**
   - *Question:* The error message states *"Your email, password, IP address or location did not match"*. What specific conditions trigger the IP/location mismatch component of this check?
   - *Status:* **Requires clarification**.

6. **"Keep Me Logged In" / Remember Me:**
   - *Question:* Is a "Remember Me" or persistent cookie functionality supported on the login form?
   - *Status:* **Requires clarification**.

---

## 10. Approvals

| Role | Name | Signature / Decision | Date |
| :--- | :--- | :--- | :--- |
| **QA Lead / Engineer** | Vijay Kumar Banik | Pending Review | 2026-11-18 |
| **Product Owner** | *(To be assigned)* | Pending Review | |
| **Engineering Lead** | *(To be assigned)* | Pending Review | |
