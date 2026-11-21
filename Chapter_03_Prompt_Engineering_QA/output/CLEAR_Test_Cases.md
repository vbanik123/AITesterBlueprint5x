# Functional Test Cases: VWO Login Module (https://app.vwo.com/)

**Document ID:** TC-VWO-LOGIN-CLEAR-001  
**Framework:** CLEAR Prompt Engineering QA Specification  
**Application Under Test:** VWO Application Login (`https://app.vwo.com/`)  
**Date:** 2026-11-18  
**Execution Status:** Not Run  

---

## 1. Context & Scope

These functional test cases are developed strictly in accordance with the approved requirements provided in `CLEAR.md`:
1. Valid registered credentials allow login.
2. Invalid credentials are rejected.
3. Email and password are mandatory.
4. Successful login opens the authenticated dashboard.

### Constraints & Rules Adhered To:
- **Exact Count:** Exactly 10 distinct test cases.
- **Scope Alignment:** Covers valid login, incorrect password, unregistered email, empty fields, and access control before and after login.
- **Data Privacy:** Credential placeholders only (`<registered_email>`, `<valid_password>`, etc.); no real passwords.
- **Zero Invention of Rules:** Exact error messages, validation copy, password policies, and session timeout thresholds are not invented and are formally marked as **"Requires clarification"**.
- **Execution Status:** All test cases are initialized to **"Not Run"**.
- **Jira Table:** Formatted using the required 10-column structure: *Test Case ID, Requirement, Summary, Preconditions, Test Data, Steps, Expected Result, Priority, Test Type, Status*.

---

## 2. Jira-Style Test Cases Table

| Test Case ID | Requirement | Summary | Preconditions | Test Data | Steps | Expected Result | Priority | Test Type | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **VWO-LOGIN-TC-001** | Valid registered credentials allow login; Successful login opens dashboard | Verify successful login with valid registered credentials | Active registered test account exists; user is logged out; browser is open | `<registered_email>`, `<valid_password>` | 1. Open https://app.vwo.com/.<br>2. Enter `<registered_email>` into Email field.<br>3. Enter `<valid_password>` into Password field.<br>4. Click Submit/Login button. | Login succeeds and the authenticated dashboard opens. | High | Positive | Not Run |
| **VWO-LOGIN-TC-002** | Invalid credentials are rejected | Verify login rejection when registered email is paired with an incorrect password | Active registered test account exists; user is logged out | `<registered_email>`, `<incorrect_password>` | 1. Open https://app.vwo.com/.<br>2. Enter `<registered_email>` into Email field.<br>3. Enter `<incorrect_password>` into Password field.<br>4. Click Submit/Login button. | Login is rejected; access is denied; user remains unauthenticated on the login page; error indicator is displayed. *(Exact error message: **Requires clarification**)* | High | Negative | Not Run |
| **VWO-LOGIN-TC-003** | Invalid credentials are rejected | Verify login rejection when an unregistered email address is submitted | Email address is confirmed not registered in the system; user is logged out | `<unregistered_email>`, `<arbitrary_password>` | 1. Open https://app.vwo.com/.<br>2. Enter `<unregistered_email>` into Email field.<br>3. Enter `<arbitrary_password>` into Password field.<br>4. Click Submit/Login button. | Login is rejected; access is denied; user remains unauthenticated on the login page; error indicator is displayed. *(Exact error message: **Requires clarification**)* | High | Negative | Not Run |
| **VWO-LOGIN-TC-004** | Email and password are mandatory; Invalid credentials rejected | Verify login submission behavior when Email field is left blank | User is on login page at https://app.vwo.com/ and logged out | Email: `<empty>`, Password: `<valid_password>` | 1. Open https://app.vwo.com/.<br>2. Leave Email field empty.<br>3. Enter `<valid_password>` into Password field.<br>4. Click Submit/Login button. | Form submission is prevented or rejected; login does not occur because Email is mandatory. *(Validation mechanism / message copy: **Requires clarification**)* | High | Negative | Not Run |
| **VWO-LOGIN-TC-005** | Email and password are mandatory; Invalid credentials rejected | Verify login submission behavior when Password field is left blank | User is on login page at https://app.vwo.com/ and logged out | Email: `<registered_email>`, Password: `<empty>` | 1. Open https://app.vwo.com/.<br>2. Enter `<registered_email>` into Email field.<br>3. Leave Password field empty.<br>4. Click Submit/Login button. | Form submission is prevented or rejected; login does not occur because Password is mandatory. *(Validation mechanism / message copy: **Requires clarification**)* | High | Negative | Not Run |
| **VWO-LOGIN-TC-006** | Email and password are mandatory; Invalid credentials rejected | Verify login submission behavior when both Email and Password fields are left blank | User is on login page at https://app.vwo.com/ and logged out | Email: `<empty>`, Password: `<empty>` | 1. Open https://app.vwo.com/.<br>2. Leave both Email and Password fields blank.<br>3. Click Submit/Login button. | Form submission is blocked; user remains unauthenticated on the login page because both fields are mandatory. *(Validation mechanism / message copy: **Requires clarification**)* | Medium | Negative | Not Run |
| **VWO-LOGIN-TC-007** | Successful login opens the authenticated dashboard | Verify post-login dashboard loading and authenticated interface display | Active registered test account exists; user is logged out | `<registered_email>`, `<valid_password>` | 1. Open https://app.vwo.com/.<br>2. Enter `<registered_email>` and `<valid_password>`.<br>3. Click Submit/Login button.<br>4. Observe post-login redirection and verify dashboard state. | Authenticated dashboard opens completely with user session active and dashboard interface accessible. | High | Positive | Not Run |
| **VWO-LOGIN-TC-008** | Successful login opens dashboard; Access control before login | Verify access control restriction when attempting direct navigation to dashboard URL without logging in | User is logged out; no active authentication session or cookie exists | Dashboard URL: `<authenticated_dashboard_url>` | 1. Open browser in a fresh session with no active cookies.<br>2. Enter `<authenticated_dashboard_url>` into address bar.<br>3. Press Enter to navigate directly. | Direct dashboard access is denied; user is redirected to the login page. *(Exact redirection behavior / session handling: **Requires clarification**)* | High | Security / Access Control | Not Run |
| **VWO-LOGIN-TC-009** | Valid credentials allow login; Access control after login | Verify state handling when navigating back to login URL while authenticated session is active | User is actively logged in with a valid session on the dashboard | Login URL: `https://app.vwo.com/` | 1. Log in with `<registered_email>` and `<valid_password>` to reach dashboard.<br>2. In the same browser session, enter `https://app.vwo.com/` into address bar.<br>3. Press Enter to load login page. | User remains authenticated; system retains session and redirects to dashboard or maintains active session state without forcing re-login. *(Exact redirection behavior: **Requires clarification**)* | Medium | Functional / State Control | Not Run |
| **VWO-LOGIN-TC-010** | Invalid credentials are rejected | Verify rejection of login attempt with both email and password having invalid values | User is on https://app.vwo.com/ and logged out | Email: `<unregistered_email>`, Password: `<invalid_password>` | 1. Open https://app.vwo.com/.<br>2. Enter `<unregistered_email>` into Email field.<br>3. Enter `<invalid_password>` into Password field.<br>4. Click Submit/Login button. | Login is rejected; access is denied; user remains unauthenticated on login page; error indicator is displayed. *(Exact error message / rate limiting: **Requires clarification**)* | High | Negative | Not Run |

---

## 3. Detailed Test Case Specifications

### Test Case: VWO-LOGIN-TC-001
- **Summary:** Verify login with valid registered credentials
- **Preconditions:** An active registered test account is available; the user is logged out.
- **Test Data:** `<registered_email>`, `<valid_password>`
- **Steps:**
  1. Open `https://app.vwo.com/`.
  2. Enter the registered email.
  3. Enter the valid password.
  4. Submit the login form.
- **Expected Result:** Login succeeds and the authenticated dashboard opens.
- **Priority:** High
- **Test Type:** Positive
- **Status:** Not Run
- **Requirement:** Valid registered credentials allow login; Successful login opens the authenticated dashboard.

---

### Test Case: VWO-LOGIN-TC-002
- **Summary:** Verify login rejection when registered email is paired with an incorrect password
- **Preconditions:** An active registered test account exists; the user is logged out.
- **Test Data:** `<registered_email>`, `<incorrect_password>`
- **Steps:**
  1. Open `https://app.vwo.com/`.
  2. Enter the registered email into the Email field.
  3. Enter an incorrect password into the Password field.
  4. Submit the login form.
- **Expected Result:** Login is rejected; access is denied; user remains unauthenticated on the login page; error indicator is displayed. *(Exact error message: **Requires clarification**)*.
- **Priority:** High
- **Test Type:** Negative
- **Status:** Not Run
- **Requirement:** Invalid credentials are rejected.

---

### Test Case: VWO-LOGIN-TC-003
- **Summary:** Verify login rejection when an unregistered email address is submitted
- **Preconditions:** The email address `<unregistered_email>` is confirmed not registered in the system; the user is logged out.
- **Test Data:** `<unregistered_email>`, `<arbitrary_password>`
- **Steps:**
  1. Open `https://app.vwo.com/`.
  2. Enter the unregistered email into the Email field.
  3. Enter an arbitrary password into the Password field.
  4. Submit the login form.
- **Expected Result:** Login is rejected; access is denied; user remains unauthenticated on the login page; error indicator is displayed. *(Exact error message: **Requires clarification**)*.
- **Priority:** High
- **Test Type:** Negative
- **Status:** Not Run
- **Requirement:** Invalid credentials are rejected.

---

### Test Case: VWO-LOGIN-TC-004
- **Summary:** Verify login submission behavior when the email field is left blank
- **Preconditions:** User is on the login page at `https://app.vwo.com/` and logged out.
- **Test Data:** Email: `<empty>`, Password: `<valid_password>`
- **Steps:**
  1. Open `https://app.vwo.com/`.
  2. Leave the Email field completely empty.
  3. Enter a valid password into the Password field.
  4. Submit the login form.
- **Expected Result:** Form submission is prevented or rejected; login does not occur because email is mandatory. *(Validation mechanism and error copy: **Requires clarification**)*.
- **Priority:** High
- **Test Type:** Negative
- **Status:** Not Run
- **Requirement:** Email and password are mandatory; Invalid credentials are rejected.

---

### Test Case: VWO-LOGIN-TC-005
- **Summary:** Verify login submission behavior when the password field is left blank
- **Preconditions:** User is on the login page at `https://app.vwo.com/` and logged out.
- **Test Data:** Email: `<registered_email>`, Password: `<empty>`
- **Steps:**
  1. Open `https://app.vwo.com/`.
  2. Enter the registered email into the Email field.
  3. Leave the Password field completely empty.
  4. Submit the login form.
- **Expected Result:** Form submission is prevented or rejected; login does not occur because password is mandatory. *(Validation mechanism and error copy: **Requires clarification**)*.
- **Priority:** High
- **Test Type:** Negative
- **Status:** Not Run
- **Requirement:** Email and password are mandatory; Invalid credentials are rejected.

---

### Test Case: VWO-LOGIN-TC-006
- **Summary:** Verify login submission behavior when both email and password fields are left blank
- **Preconditions:** User is on the login page at `https://app.vwo.com/` and logged out.
- **Test Data:** Email: `<empty>`, Password: `<empty>`
- **Steps:**
  1. Open `https://app.vwo.com/`.
  2. Leave both Email and Password fields completely empty.
  3. Submit the login form.
- **Expected Result:** Form submission is blocked; user remains unauthenticated on the login page because both fields are mandatory. *(Validation mechanism and error copy: **Requires clarification**)*.
- **Priority:** Medium
- **Test Type:** Negative
- **Status:** Not Run
- **Requirement:** Email and password are mandatory; Invalid credentials are rejected.

---

### Test Case: VWO-LOGIN-TC-007
- **Summary:** Verify post-login dashboard loading and authenticated interface display
- **Preconditions:** Active registered test account exists; the user is logged out.
- **Test Data:** `<registered_email>`, `<valid_password>`
- **Steps:**
  1. Open `https://app.vwo.com/`.
  2. Enter valid registered credentials into Email and Password fields.
  3. Submit the login form.
  4. Observe post-login redirection and verify dashboard state.
- **Expected Result:** User is successfully redirected to the authenticated dashboard; dashboard interface loads completely with active authenticated session.
- **Priority:** High
- **Test Type:** Positive
- **Status:** Not Run
- **Requirement:** Successful login opens the authenticated dashboard.

---

### Test Case: VWO-LOGIN-TC-008
- **Summary:** Verify access control restriction when attempting direct navigation to dashboard URL without logging in
- **Preconditions:** User is logged out; no active authentication session or cookie exists in the browser.
- **Test Data:** Dashboard URL: `<authenticated_dashboard_url>`
- **Steps:**
  1. Open a fresh browser instance with no active authentication cookies.
  2. Enter `<authenticated_dashboard_url>` into the browser address bar.
  3. Press Enter to navigate directly.
- **Expected Result:** Direct dashboard access is denied; unauthenticated user is redirected to the login page (`https://app.vwo.com/`). *(Exact redirection behavior and session handling: **Requires clarification**)*.
- **Priority:** High
- **Test Type:** Security / Access Control
- **Status:** Not Run
- **Requirement:** Successful login opens the authenticated dashboard; Access control before login.

---

### Test Case: VWO-LOGIN-TC-009
- **Summary:** Verify state handling when navigating back to login URL while authenticated session is active
- **Preconditions:** User is currently logged in with an active session on the dashboard.
- **Test Data:** Login URL: `https://app.vwo.com/`
- **Steps:**
  1. Complete successful login with `<registered_email>` and `<valid_password>` to land on dashboard.
  2. In the same browser session, type `https://app.vwo.com/` into the browser address bar.
  3. Press Enter to navigate to the login URL.
- **Expected Result:** User remains authenticated; application retains session and redirects user to dashboard or maintains active session without requiring re-authentication. *(Exact redirection behavior: **Requires clarification**)*.
- **Priority:** Medium
- **Test Type:** Functional / State Control
- **Status:** Not Run
- **Requirement:** Valid registered credentials allow login; Access control after login.

---

### Test Case: VWO-LOGIN-TC-010
- **Summary:** Verify rejection of login attempt with both email and password having invalid values
- **Preconditions:** User is on `https://app.vwo.com/` and logged out.
- **Test Data:** Email: `<unregistered_email>`, Password: `<invalid_password>`
- **Steps:**
  1. Open `https://app.vwo.com/`.
  2. Enter `<unregistered_email>` into the Email field.
  3. Enter `<invalid_password>` into the Password field.
  4. Submit the login form.
- **Expected Result:** Login is rejected; access is denied; user remains unauthenticated on the login page; error indicator is displayed. *(Exact error message and rate limiting: **Requires clarification**)*.
- **Priority:** High
- **Test Type:** Negative
- **Status:** Not Run
- **Requirement:** Invalid credentials are rejected.

---

## 4. Open Questions & Items Requiring Clarification

| Item # | Area | Specific Question | Reason for Clarification |
| :--- | :--- | :--- | :--- |
| **1** | Error Messaging | What is the exact copy of the error message displayed when invalid credentials are submitted? | Approved requirements state "Invalid credentials are rejected" but do not specify error copy. |
| **2** | Mandatory Fields | Does empty field validation happen client-side (inline beneath fields) or via server response? What is the exact text? | Approved requirements state fields are mandatory without specifying error presentation. |
| **3** | Password Policy | What are the minimum length, character set, or complexity requirements for passwords? | Password rules were not provided in requirements. |
| **4** | Session Management | What is the session idle timeout limit on the authenticated dashboard? | Session lifecycle policies are not defined. |
| **5** | Redirection Rules | Does entering the login URL while logged in redirect to dashboard or display an "already logged in" banner? | State retention behavior is unspecified. |
