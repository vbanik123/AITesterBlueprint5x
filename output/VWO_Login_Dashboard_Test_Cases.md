# VWO Login Dashboard — Test Cases

Source: Product Requirements Document, VWO Login Dashboard (`app.vwo.com`)  
Rules: Anti-Hallucination Rules  
Blocked cases are omitted. Only cases with an expected result stated in the PRD are included.

Where a label or indicator text is not in the PRD, the case checks the behavior the PRD does state. It does not check a guessed string.

Test accounts are supplied by the test environment. The PRD contains none.

---

## Verified Facts

- The login dashboard is at `app.vwo.com`.
- The existing screen has a modern, minimalist login form with VWO branding, an email field, a password field, a Remember Me checkbox for persistent login sessions, a registration link to free-trial signup, and a banner for the new UI launch with Light and Dark Mode options.
- Login uses email and password with secure validation.
- A failed attempt shows a clear, actionable error message.
- A successful login gives a clear success indication and moves the user to the main personalized VWO dashboard.
- A secure session token is generated and managed.
- 2FA is optional.
- Field validation runs on blur and feedback is immediate.
- Email entry on mobile uses a specialized mobile keyboard.
- Password entry shows visual feedback for requirements and strength.
- The first input field is focused automatically.
- Form labels are clickable.
- Authentication processing shows clear loading feedback.
- Light Mode and Dark Mode are both supported.
- Screen readers get ARIA labels, and every interactive element is keyboard accessible.
- The accessibility target is WCAG 2.1 AA.
- Login communications use HTTPS with SSL/TLS.
- Authentication data is encrypted in transit.
- Login-page images are compressed. CSS and JavaScript are minified.

Phase 1 in the PRD is the secure login form plus basic validation and error handling. Phase 2 is mobile optimization, accessibility, and advanced validation and feedback. Requirements the PRD does not place in a phase are marked `Not mapped to a phase in the PRD`.

---

## Missing / Unknown Information

These gaps are recorded and not turned into test cases.

`Insufficient information to determine` for: exact message text, email-format grammar, password-complexity rules, session-timeout value, Remember Me duration, 2FA factor type, reset-token rules, recovery options other than email, which previous-session context is kept, device and viewport list, design-system tokens, high-contrast control, hash algorithm, rate-limit threshold, OWASP edition, GDPR and CCPA obligations for this screen, audit events, the meaning of "standard connections", CDN host, region list, concurrency count, analytics event names, support channel, SSO screen details, identity providers other than Google and Microsoft, and free-trial signup contents.

`Inference (low confidence)` used below: an account without 2FA completes email-and-password login without a second factor, because the PRD says 2FA is optional. Password-strength feedback is checked while typing, because the PRD ties that feedback to password entry and does not name another screen.

---

## Generated Output

### TC-UI-001 — Branded minimalist login form
- PRD source: Current State Analysis > Existing Features > Clean Interface Design
- Phase: Phase 1
- Preconditions: `app.vwo.com` is reachable.
- Steps:
  1. Open `app.vwo.com`.
  2. Look at the login form and branding.
- Expected result: The page shows a modern, minimalist login form with VWO branding.

### TC-UI-002 — Email and password fields
- PRD source: Current State Analysis > Existing Features > Standard Authentication Fields
- Phase: Phase 1
- Preconditions: `app.vwo.com` is reachable.
- Steps:
  1. Open `app.vwo.com`.
  2. Look at the form fields.
- Expected result: The form has an email address field and a password field.

### TC-UI-003 — Remember Me checkbox
- PRD source: Current State Analysis > Existing Features > Remember Me Functionality
- Phase: Not mapped to a phase in the PRD
- Preconditions: `app.vwo.com` is reachable.
- Steps:
  1. Open `app.vwo.com`.
  2. Look at the login form.
- Expected result: A Remember Me checkbox is present for persistent login sessions.

### TC-UI-004 — Registration link to free-trial signup
- PRD source: Current State Analysis > Account Registration Link; User Journey > Registration Path
- Phase: Not mapped to a phase in the PRD
- Preconditions: `app.vwo.com` is reachable.
- Steps:
  1. Open `app.vwo.com`.
  2. Use the account registration link.
- Expected result: The link is a direct path to free-trial signup, and the page offers a clear free-trial call to action.
- Unspecified detail: Signup-page fields and the exact link text. `Insufficient information to determine.` This case stops at the free-trial signup destination.

### TC-UI-005 — New-UI announcement banner
- PRD source: Current State Analysis > Existing Features > Product Announcements
- Phase: Not mapped to a phase in the PRD
- Preconditions: `app.vwo.com` is reachable.
- Steps:
  1. Open `app.vwo.com`.
  2. Read the announcement banner.
- Expected result: The banner highlights the new UI launch and Light and Dark Mode options.

### TC-AUTH-001 — Successful email and password login
- PRD source: Login Process > Primary Authentication; Error Recovery Flow > Success Confirmation
- Phase: Phase 1
- Preconditions: The test environment supplies an existing account that can sign in with email and password.
- Steps:
  1. Open `app.vwo.com`.
  2. Enter that account's email address.
  3. Enter that account's password.
  4. Submit the login form.
- Expected result: Authentication uses email and password with secure validation, and the user sees a clear indication that login completed.
- Unspecified detail: Submit-control label and the exact success sentence. `Insufficient information to determine.`

### TC-AUTH-002 — Transition to the main dashboard
- PRD source: Integration Requirements > VWO Core Platform; Returning User Experience > Dashboard Transition
- Phase: Not mapped to a phase in the PRD
- Preconditions: Same account as TC-AUTH-001.
- Steps:
  1. Complete a successful email-and-password login.
  2. Observe where the user lands.
- Expected result: The user reaches the main VWO dashboard and gets immediate access to the personalized dashboard.

### TC-AUTH-003 — Failed authentication message
- PRD source: User Input Validation > Error Handling; Error Recovery Flow > Error Identification
- Phase: Phase 1
- Preconditions: The test environment supplies a failing pair for an existing account: the correct email with a password that is not that account's password.
- Steps:
  1. Open `app.vwo.com`.
  2. Submit the login form with that failing pair.
- Expected result: Login fails, and the user sees a clear, actionable error message.
- Unspecified detail: The exact message text. `Insufficient information to determine.` Fail the case when no error is shown. Do not compare the text with a guessed sentence.

### TC-AUTH-004 — Secure session after login
- PRD source: Login Process > Session Management; Data Protection > Session Security
- Phase: Not mapped to a phase in the PRD
- Preconditions: Same account as TC-AUTH-001.
- Steps:
  1. Log in successfully.
  2. Continue into the authenticated VWO dashboard.
- Expected result: Login creates a secure session, and that session is what grants access to the dashboard.
- Unspecified detail: Token storage and cookie flags. `Insufficient information to determine.` This case checks that the authenticated session exists.

### TC-AUTH-007 — Login when 2FA is not enabled
- PRD source: Login Process > Multi-Factor Authentication
- Phase: Not mapped to a phase in the PRD
- Preconditions: The test environment supplies an account that does not have 2FA enabled.
- Steps:
  1. Open `app.vwo.com`.
  2. Submit that account's email and password.
- Expected result: `Inference (low confidence)`. Because 2FA is optional, this account completes login with email and password and is not asked for a second factor.

### TC-VAL-001 — Validation on blur
- PRD source: User Input Validation > Real-time Validation
- Phase: Phase 1
- Preconditions: The login form is open. Use a value the environment already defines as invalid for a field the PRD says is validated. Do not invent an email grammar or a password rule.
- Steps:
  1. Enter that value.
  2. Leave the field so it blurs.
- Expected result: Validation runs on blur, and feedback appears immediately.

### TC-VAL-003 — Specialized mobile keyboard for email
- PRD source: User Input Validation > Email Format Verification
- Phase: Phase 2
- Preconditions: The login page is open in a mobile browser context. The PRD does not name a device.
- Steps:
  1. Open `app.vwo.com` in that mobile context.
  2. Focus the email address field.
- Expected result: A specialized mobile keyboard is shown for email entry.
- Unspecified detail: The keyboard variant name. `Insufficient information to determine.`

### TC-VAL-004 — Password strength and requirements feedback
- PRD source: User Input Validation > Password Strength Indicators
- Phase: Phase 2
- Preconditions: The login form is open.
- Steps:
  1. Focus the password field.
  2. Type into the password field.
- Expected result: The user sees visual feedback for password requirements and for password strength.
- Unspecified detail: `Inference (low confidence)` that this feedback is shown during entry. The meter design and the requirement list are not in the PRD. `Insufficient information to determine.` Fail the case when no visual feedback appears.

### TC-UX-002 — Auto-focus on the first field
- PRD source: Interface Design > Auto-focus
- Phase: Not mapped to a phase in the PRD
- Preconditions: Fresh page load of the login dashboard. Do not click or type before observing focus.
- Steps:
  1. Open `app.vwo.com`.
  2. See which field has focus.
- Expected result: The first input field has focus automatically.
- Unspecified detail: The PRD does not name that field. `Insufficient information to determine.` Do not require the email field unless it is actually the first input.

### TC-UX-003 — Clickable labels
- PRD source: Interface Design > Clickable Labels
- Phase: Phase 2
- Preconditions: The login form is open.
- Steps:
  1. Click the label for the email field.
  2. Click the label for the password field.
  3. Click the label for Remember Me.
- Expected result: Each label is clickable and activates its control.
- Unspecified detail: Email and password label strings. `Insufficient information to determine.` Remember Me is the checkbox name given in the PRD.

### TC-UX-004 — Loading feedback during authentication
- PRD source: Interface Design > Loading States
- Phase: Not mapped to a phase in the PRD
- Preconditions: Same account as TC-AUTH-001.
- Steps:
  1. Submit a valid login.
  2. Watch the form while authentication is still processing.
- Expected result: The user sees clear feedback that authentication is processing.
- Unspecified detail: Spinner, text, or disabled control. `Insufficient information to determine.` Fail the case when there is no processing feedback.

### TC-UX-005 — Light Mode
- PRD source: Branding and Visual Design > Theme Support; Product Announcements
- Phase: Not mapped to a phase in the PRD
- Preconditions: The login dashboard is open.
- Steps:
  1. Choose the Light Mode option.
  2. Look at the login experience.
- Expected result: Light Mode is available, and the login experience renders in Light Mode.
- Unspecified detail: Where the control sits, and the color tokens. `Insufficient information to determine.`

### TC-UX-006 — Dark Mode
- PRD source: Branding and Visual Design > Theme Support; Product Announcements
- Phase: Not mapped to a phase in the PRD
- Preconditions: The login dashboard is open.
- Steps:
  1. Choose the Dark Mode option.
  2. Look at the login experience.
- Expected result: Dark Mode is available, and the login experience renders in Dark Mode.
- Unspecified detail: Where the control sits, and the color tokens. `Insufficient information to determine.`

### TC-A11Y-001 — ARIA labels for screen readers
- PRD source: Accessibility Features > Screen Reader Support
- Phase: Phase 2
- Preconditions: A screen reader is available. The PRD does not name which one.
- Steps:
  1. Move through each login control with the screen reader.
- Expected result: Interactive controls expose ARIA labels and work with the screen reader.

### TC-A11Y-002 — Keyboard access to every interactive element
- PRD source: Accessibility Features > Keyboard Navigation
- Phase: Phase 2
- Preconditions: The login dashboard is open. Do not use a pointer.
- Steps:
  1. Move to every interactive element with the keyboard only.
  2. Operate the email field, password field, Remember Me, registration link, and submit action from the keyboard.
- Expected result: Every interactive element can be reached and operated from the keyboard.

### TC-A11Y-004 — WCAG 2.1 AA
- PRD source: Accessibility Standards > WCAG Compliance
- Phase: Phase 2
- Preconditions: The login experience can be reviewed against WCAG 2.1 AA.
- Steps:
  1. Assess the login dashboard against WCAG 2.1 AA.
- Expected result: The login experience conforms to WCAG 2.1 AA.

### TC-SEC-001 — HTTPS with SSL/TLS
- PRD source: Data Protection > HTTPS Enforcement
- Phase: Not mapped to a phase in the PRD
- Preconditions: The login dashboard is requested at `app.vwo.com`.
- Steps:
  1. Open the login dashboard.
  2. Confirm the page is served over HTTPS.
- Expected result: Login communications use SSL/TLS over HTTPS.
- Unspecified detail: Cipher suite and certificate issuer. `Insufficient information to determine.`

### TC-SEC-002 — Authentication data encrypted in transit
- PRD source: Data Protection > Encryption
- Phase: Not mapped to a phase in the PRD
- Preconditions: A login attempt can be observed at the transport level. Do not store the password in the report.
- Steps:
  1. Submit a login.
  2. Confirm the authentication data travels only inside the HTTPS channel from TC-SEC-001.
- Expected result: Authentication data is encrypted in transit.

### TC-PERF-002 — Compressed images and minified CSS/JavaScript
- PRD source: Load Time Optimization > Asset Optimization
- Phase: Not mapped to a phase in the PRD
- Preconditions: Login-page assets can be inspected.
- Steps:
  1. Load `app.vwo.com`.
  2. Inspect the images, CSS, and JavaScript used by the login page.
- Expected result: Images are compressed. CSS and JavaScript files are minified.
- Unspecified detail: File names and compression algorithm. `Insufficient information to determine.` An unminified stylesheet or script delivered as a login asset fails this case.

---

## Self-Validation Check

- 24 test cases. Each expected result is a statement from the PRD.
- Blocked cases are not in this file. That includes password rules, email grammar, timeouts, rate limits, SSO, social login, analytics events, reset tokens, high contrast, CDN, uptime, concurrency, and regions.
- Future enhancements from the PRD are not test cases.
- No error text, button label, API, field id, credential, timeout, or rate-limit number was invented.
- Two items are marked `Inference (low confidence)`: TC-AUTH-007 and the observation point in TC-VAL-004.
- The only URL used is `app.vwo.com`.
