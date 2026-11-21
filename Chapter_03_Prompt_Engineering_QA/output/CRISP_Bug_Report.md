# Defect Report: Missing Validation Feedback on Empty Password Submission

**Notice:** [Hypothetical training example – Not a confirmed issue in VWO]  
**Defect ID:** BUG-VWO-TRN-001  
**Target Application:** VWO Login (`https://app.vwo.com/`)  
**Date Logged:** 2026-11-18  
**Reporter:** Senior QA Engineer (Training Exercise)  

---

## 1. Title
`[Hypothetical Training Example] VWO Login: Submitting login form with empty password triggers submission without visible validation feedback`

---

## 2. Environment
| Parameter | Value |
| :--- | :--- |
| **Application URL** | `https://app.vwo.com/` |
| **Build / Release** | Not supplied |
| **Browser / Version** | Not supplied |
| **Operating System** | Not supplied |
| **Execution Time** | Not supplied |

---

## 3. Preconditions
1. The user is logged out.
2. The VWO login page (`https://app.vwo.com/`) is loaded.
3. A registered test account is available.

---

## 4. Test Data
- **Email:** `<registered_test_email>`
- **Password:** `<empty>` (field left completely blank)

---

## 5. Steps to Reproduce
1. Navigate to `https://app.vwo.com/`.
2. Enter `<registered_test_email>` into the Email field.
3. Leave the Password field empty.
4. Click the login/submit button.

---

## 6. Expected Result
Based on the approved requirement that **password is mandatory**:
- Form submission should be prevented or rejected.
- Visible validation feedback should be presented to the user indicating that the password field is required.

*(Note: Exact validation error text and inline presentation styling are not specified in supplied requirements and are distinguished here from observed behavior).*

---

## 7. Actual Result
The form submits, but no visible validation feedback appears on the page. The user is left with no visual feedback explaining why authentication did not proceed.

---

## 8. Reproducibility
- **Rate:** 100% reproducible (observed in **3 out of 3 attempts**).

---

## 9. Suggested Severity and Rationale
- **Suggested Severity:** **Medium (Provisional)**
- **Rationale:** The password field is explicitly specified as mandatory. Failure to provide visible validation feedback violates usability and core form handling standards by leaving users unaware of why the login attempt stalled. Severity is labeled **provisional** pending confirmation of client-side validation rules and backend API error contracts.

---

## 10. Attachments
- **Screenshots:** Not provided
- **Screen Recording:** Not provided
- **Network / Console Logs:** Not provided
