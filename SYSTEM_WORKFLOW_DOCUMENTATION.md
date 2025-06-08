# System Workflow Documentation

This document outlines the detailed workflows for different user roles within the insurance application.

## Table of Contents

1.  [Identified Roles](#identified-roles)
2.  [Customer Workflow](#customer-workflow)
    *   [A. New Quote Generation & Initial Information Entry](#a-new-quote-generation--initial-information-entry)
    *   [B. Retrieving an Existing Quote](#b-retrieving-an-existing-quote)
    *   [C. Completing Quote Details (Multi-Step Form)](#c-completing-quote-details-multi-step-form)
    *   [D. Reviewing Quote and Purchasing Policy](#d-reviewing-quote-and-purchasing-policy)
    *   [E. Editing a Retrieved/In-Progress Quote](#e-editing-a-retrievedin-progress-quote)
3.  [Admin Workflow](#admin-workflow)
    *   [A. Login](#a-login)
    *   [B. Dashboard Overview](#b-dashboard-overview)
    *   [C. Managing Quotes](#c-managing-quotes)
    *   [D. Managing Policies](#d-managing-policies)
    *   [E. Viewing Transactions](#e-viewing-transactions)
    *   [F. Admin Quote/Policy Creation](#f-admin-quotepolicy-creation)
    *   [G. System Maintenance](#g-system-maintenance)
4.  [Core Backend Processes Supporting Workflows](#core-backend-processes-supporting-workflows)
    *   [A. Quote Data Management](#a-quote-data-management)
    *   [B. Policy Data Management](#b-policy-data-management)
    *   [C. Premium Calculation Logic](#c-premium-calculation-logic)
    *   [D. Email Notifications](#d-email-notifications)
    *   [E. PDF Generation](#e-pdf-generation)

## 1. Identified Roles

Two primary roles have been identified:

*   **Customer**: Users seeking to get an insurance quote, potentially purchase a policy, and manage their information. They interact primarily through the customer-facing Next.js application.
*   **Admin**: Internal users responsible for managing quotes, policies, viewing system activity, and potentially assisting customers. They have a dedicated admin panel.

## 2. Customer Workflow

The customer journey involves several key stages, from obtaining an initial quote to potentially purchasing a policy. The `QuoteContext` plays a central role in managing state across these frontend steps.

### A. New Quote Generation & Initial Information Entry

1.  **Access Quote Generator**:
    *   **Frontend**: User navigates to `/customer/quote-generator`. Any existing `quoteNumber` in `localStorage` is cleared.
    *   **UI**: Displays a form for initial quote details.

2.  **Input Initial Details**:
    *   **Frontend**: User provides:
        *   Policy Holder's Resident State
        *   Event Type
        *   Maximum Number of Guests
        *   Event Date (validated to be in future, >=48 hours ahead, within 2 years)
        *   Email Address
        *   Desired Core Coverage Level
        *   Desired Liability Coverage (optional, defaults to 'none')
        *   Host Liquor Liability (optional, dependent on Liability Coverage being selected)
        *   Acknowledgement of COVID-19 disclosure.
        *   Indication of Special Activities (if any, triggers a warning modal).
    *   Input changes are stored in `QuoteContext`. Errors are cleared as fields are corrected. Hides previous quote results if key calculation fields change.

3.  **Calculate Quote (Client-Side Preview)**:
    *   **Frontend**: User clicks "Calculate Quote".
        *   Client-side validation (`validateForm()`) checks mandatory fields and rules. If errors, toasts are shown, and page scrolls to the first error.
        *   If valid, `QuoteContext` dispatches `CALCULATE_QUOTE`. The context's reducer calculates `basePremium`, `liabilityPremium`, `liquorLiabilityPremium`, and `totalPremium` **on the frontend** using predefined constants (from `frontend/src/utils/constants.ts`). A UI-only `quoteNumber` (e.g., `PCI-YYYYMMDD-SEQ`) is generated.
        *   UI updates to show these calculated premiums in a "Quote Results" section (`showQuoteResults = true`).

4.  **Save Initial Quote & Send Notification (Backend Interaction)**:
    *   **Frontend**: (This happens when "Calculate Quote" is successful and results are shown, or as part of a "Continue" action that implies saving the calculated quote)
        *   An API call `POST /api/v1/quotes` is made.
        *   **Request Body**: All data from `QuoteContext` (including frontend-calculated premiums) and an added `source: "CUSTOMER"` field.
    *   **Backend (`POST /api/v1/quotes`)**:
        *   Sets `effectiveSource` to `CUSTOMER`. Validates email.
        *   Finds or creates a `User` record by email.
        *   Creates a new `Quote` entity:
            *   Generates a persistent `quoteNumber` (e.g., `QN12345678`).
            *   Sets `status` to `StepStatus.STEP1`.
            *   Stores all provided fields, **including the premiums calculated by the frontend**.
            *   Associates the `User`.
        *   Saves the `Quote` to the database.
        *   **Response**: `201 Created` with the backend `quoteNumber` and the full saved `Quote` object.
    *   **Frontend (Handling Response)**:
        *   Stores the backend-generated `quoteNumber` in `localStorage` and updates `QuoteContext`.
        *   Makes an API call: `POST /api/v1/email/send`.
            *   **Request Body**: `{ to: customerEmail, type: 'quote', data: savedQuoteObjectFromBackend }`.
    *   **Backend (`POST /api/v1/email/send`)**:
        *   Dispatches a quote notification email (see Email Notification Workflow).
    *   **Frontend**: Displays success/failure toast for email. The user is typically directed to the next step (`/customer/event-information`) or a "Continue" button becomes active. `step1Complete` in `QuoteContext` is set.

### B. Retrieving an Existing Quote

1.  **Access Retrieval Page**:
    *   **Frontend**: User navigates to `/retrive-quote`.
2.  **Input Quote/Policy ID**:
    *   **Frontend**: User enters their Quote ID (e.g., "QN12345678") or Policy ID (e.g., "WI...", "POC...", "QI-").
3.  **Submit for Retrieval**:
    *   **Frontend**: User clicks "Retrieve".
        *   API call `GET /api/v1/quotes?quoteNumber={enteredID}`.
    *   **Backend (`GET /api/v1/quotes`)**:
        *   Finds the `Quote` by `quoteNumber`. Loads relations (`event`, `event.venue`, `policyHolder`, `policy`).
        *   **Response**: `200 OK` with the `quote` object if found, else `404 Not Found`.
    *   **Frontend (Handling Response)**:
        *   If `quote.convertedToPolicy` is true, an error ("quote already converted") is shown, and user is redirected to `/customer/quote-generator`.
        *   If the ID format suggests an editable quote (e.g., "WI", "POC", "QI-", though this logic might need refinement as "QN" is the actual quote number format), the user is redirected to `/customer/edit/{enteredID}`.
        *   Otherwise, an "Invalid ID" error is shown.

### C. Completing Quote Details (Multi-Step Form)

This flow typically follows initial quote generation or successful retrieval of an editable quote. The `quoteNumber` from `localStorage` is crucial. `QuoteContext` holds the state.

1.  **Step 2: Event & Venue Information (`/customer/event-information`)**:
    *   **Frontend**:
        *   Redirects to `/customer/quote-generator` if `QuoteContext.step1Complete` is false.
        *   Displays form for Honoree names and detailed Venue information (ceremony, and optionally for weddings: reception, brunch, rehearsal, rehearsal dinner - including type, name, address, add as additional insured).
        *   User inputs data. `QuotePreview` component shows live summary.
        *   On "Continue":
            *   Client-side validation.
            *   API call `PUT /api/v1/quotes/{quoteNumberFromLocalStorage}`.
            *   **Request Body**: Honoree and Venue fields from `QuoteContext`.
    *   **Backend (`PUT /api/v1/quotes/{quoteNumber}`):**
        *   Finds the quote.
        *   **Premium Recalculation**: If fields affecting premiums (e.g., `maxGuests` if it were part of this step's editable fields) are changed, premiums are recalculated **on the backend**.
        *   Merges new/updated data into the `Quote` and its related `Event`/`Venue` entities (creates them if not existing for this quote). Saves.
        *   **Response**: `200 OK` with the updated `Quote` object.
    *   **Frontend**:
        *   Dispatches `COMPLETE_STEP` (for step 2) to `QuoteContext`.
        *   Navigates to `/customer/policy-holder`.

2.  **Step 3: Policyholder Information (`/customer/policy-holder`)**:
    *   **Frontend**:
        *   Redirects to `/customer/event-information` if `QuoteContext.step2Complete` is false.
        *   Displays form for Policyholder's first/last name, phone, relationship, mailing address, referral source, and legal notices agreement.
        *   User inputs data. `QuotePreview` shows summary.
        *   On "Continue":
            *   Client-side validation.
            *   API call `PUT /api/v1/quotes/{quoteNumberFromLocalStorage}`.
            *   **Request Body**: Policyholder fields from `QuoteContext`.
    *   **Backend (`PUT /api/v1/quotes/{quoteNumber}`):**
        *   Finds quote. Merges new/updated data into `Quote` and `PolicyHolder` entity. Saves. (Premium recalculation unlikely here unless fields like `residentState` were editable and impactful).
        *   **Response**: `200 OK` with updated `Quote`.
    *   **Frontend**:
        *   Dispatches `COMPLETE_STEP` (for step 3) to `QuoteContext`.
        *   Navigates to `/customer/review`.

### D. Reviewing Quote and Purchasing Policy

1.  **Step 4: Review (`/customer/review`)**:
    *   **Frontend**:
        *   Redirects to `/customer/quote-generator` if `QuoteContext.step3Complete` or `quoteNumber` is missing.
        *   Displays a full summary of all quote details from `QuoteContext`.
        *   Provides a "Download Quote PDF" button (triggers client-side PDF generation using `jspdf`).
        *   Shows "Total Premium" and breakdown.
        *   If not yet paid, presents a "Complete Purchase" button which navigates to `/customer/payment`.
        *   A "Back" button allows navigation to `/customer/policy-holder`.
        *   `QuotePreview` is also displayed.

2.  **Step 5: Payment Simulation (`/customer/payment`)**:
    *   **Frontend**:
        *   Displays a dummy payment gateway (options: Net Banking, UPI, Credit Card).
        *   User selects method and clicks "Pay Now".
        *   `handlePay` function:
            *   Retrieves `quoteNumber` from `localStorage`.
            *   Fetches current quote details: `GET /api/v1/quotes?quoteNumber={quoteNumber}` (to get `totalPremium` and `quote.id`).
            *   Submits payment record: `POST /api/v1/payment`.
            *   **Request Body**: `{ amount: quote.totalPremium, quoteId: quote.id, method: selectedPaymentMethod, status: "SUCCESS" }`.
    *   **Backend (`POST /api/v1/payment`)**:
        *   Validates input. Creates and saves a `Payment` entity with `status: PaymentStatus.SUCCESS`.
        *   **Response**: `201 Created` with the saved `Payment` object.
    *   **Frontend**: Redirects to `/customer/review?payment=success&method={selectedMethod}`.

3.  **Step 6: Post-Payment Review & Policy Issuance (`/customer/review?payment=success`)**:
    *   **Frontend**:
        *   Page detects `payment=success` query parameter. UI changes to "Processing Payment..."
        *   `savePolicyAndPayment` function is triggered:
            *   Validates all fields in `QuoteContext` via `validateAllFields()`.
            *   Updates quote status: `PUT /api/v1/quotes/{quoteNumberFromLocalStorage}` with `status: "COMPLETE"`.
    *   **Backend (`PUT /api/v1/quotes/{quoteNumber}`):** Updates quote status to `StepStatus.COMPLETE`.
    *   **Frontend (`savePolicyAndPayment` continues)**:
        *   Converts quote to policy: `POST /api/v1/policies/from-quote`.
        *   **Request Body**: `{ quoteNumber: quoteNumberFromLocalStorage }`.
    *   **Backend (`POST /api/v1/policies/from-quote`)**:
        *   Finds `Quote`. Sets `quote.status = StepStatus.COMPLETE` and saves.
        *   Calls `createPolicyFromQuote(quote.id)` service function.
            *   **`policy.service.ts::createPolicyFromQuote`**:
                *   Uses a DB transaction.
                *   Generates unique `policyNumber` (e.g., `PI...`).
                *   Creates new `Policy` entity, links to `Quote`. Saves `Policy`.
                *   Sets `quote.convertedToPolicy = true`. Saves `Quote`.
                *   Returns the new `Policy`.
        *   **Response**: `201 Created` with `policyNumber` and full `Policy` object.
    *   **Frontend (`savePolicyAndPayment` handles response)**:
        *   UI changes to "Payment Successful". Displays `policyNumber`.
        *   "Download Policy Documents" button appears (uses client-side `generatePdf()`).
        *   "Return to Home" button.
        *   Triggers policy email: `POST /api/v1/email/send`.
            *   **Request Body**: `{ to: customerEmail, type: 'policy', data: fullPolicyObjectFromResponse }`.
    *   **Backend (`POST /api/v1/email/send`)**: Dispatches policy email with PDF attachment (see Email Notification Workflow).

### E. Editing a Retrieved/In-Progress Quote (`/customer/edit/{quoteId}`)

1.  **Entry Point**: User is redirected here from `/retrive-quote` if the quote is found and not yet converted to a policy.
2.  **Frontend**:
    *   The page likely fetches the full quote data using `GET /api/v1/quotes?quoteNumber={quoteId}`.
    *   Populates `QuoteContext` with this data using `dispatch({ type: 'SET_ENTIRE_QUOTE_STATE', payload: fetchedQuoteData })`.
    *   The user can then navigate through the multi-step form (`event-information`, `policy-holder`, `review`) starting from the first step or the step appropriate for editing.
    *   The `ProgressTracker` is hidden in this mode.
    *   Saving changes at each step uses the same `PUT /api/v1/quotes/{quoteId}` calls as the regular multi-step flow.
    *   The user can eventually proceed to review and payment if all required information is complete.

## 3. Admin Workflow

Admins interact with a dedicated panel to manage the system and assist users.

### A. Login

1.  **Access Login Page**:
    *   **Frontend**: Admin navigates to `/admin/login`.
    *   If already logged in (checks `localStorage.getItem("admin_logged_in") === "true"`), redirects to `/admin`.
2.  **Submit Credentials**:
    *   **Frontend**: Admin enters email and password.
        *   **Client-side Authentication**: Compares input against hardcoded `ADMIN_EMAIL` ("admin@weddingguard.com") and `ADMIN_PASS` ("admin123").
        *   If match: `localStorage.setItem("admin_logged_in", "true")`, redirects to `/admin`.
        *   If no match: Displays error message.
    *   **Backend (`POST /api/v1/login`)**: This route exists and also checks for hardcoded "admin123"/"admin123". The frontend admin login does not seem to use this API endpoint currently, relying on client-side checks.

### B. Dashboard Overview (`/admin`)

1.  **View Dashboard**:
    *   **Frontend**:
        *   Protected by `AdminLayout` which should check `localStorage` for "admin_logged_in".
        *   Fetches data:
            *   All policies: `GET /api/v1/policy-list`.
            *   All quotes: `GET /api/v1/quotes?allQuotes=true`.
        *   Calculates and displays statistics for "Total Policies," "Total Quotes," and "Premium Revenue" (current 30 days vs. previous 30 days).
        *   Displays "Recent Quotes" (last 5 created).
        *   Displays "Recent Transactions" (also derived from the last 5 quotes, showing quote number as transaction ID, customer name, premium).
    *   **Actions**:
        *   Clicking stat cards navigates to respective list pages (`/admin/policies`, `/admin/quotes`, `/admin/transactions`).
        *   "Generate Policy" and "Create Quote" buttons both link to `/admin/create-quote/step1`.
        *   "View All" links for recent items go to list pages.

### C. Managing Quotes (`/admin/quotes`)

1.  **View Quotes List**:
    *   **Frontend**:
        *   Fetches all quotes: `GET /api/v1/quotes?allQuotes=true`.
        *   Displays quotes in a paginated table (client-side pagination).
        *   **Features**: Search (ID, name, email), Filter (date range, status), Export (CSV, PDF for filtered data).
2.  **Actions on Quotes**:
    *   **View**: Navigates to `/admin/quotes/{quoteNumber}` (detail page - not explicitly read, but structure implies its existence).
    *   **Edit**: Navigates to `/admin/quotes/{quoteNumber}/edit` (detail edit page - not explicitly read). Allows modification, then likely `PUT /api/v1/quotes/{quoteNumber}`. Premiums are recalculated on backend if relevant fields change.
    *   **Convert to Policy**:
        *   For quotes with status `COMPLETE`.
        *   Frontend prompts for confirmation.
        *   API call: `POST /api/v1/policies/from-quote` with `{ quoteNumber, forceConvert: true }`.
        *   Backend converts quote to policy (see Policy Creation Workflow A.8).
        *   Frontend shows success toast and refreshes list.
    *   **Delete**:
        *   Frontend prompts for confirmation.
        *   API call: `DELETE /api/v1/quotes/{quoteNumber}`.
        *   Backend deletes quote and associated child entities (Event, Venue, PolicyHolder, Payments, Policy versions if any).
        *   Frontend shows success toast and refreshes list.
    *   **Email**: (Functionality commented out in frontend code but intended) Would likely fetch quote details and call `POST /api/v1/email/send` with `type: 'quote'`.

### D. Managing Policies (`/admin/policies`)

1.  **View Policies List**:
    *   **Frontend**:
        *   Fetches policies with server-side pagination: `GET /api/v1/policy-list?page={page}&pageSize={size}`.
        *   Displays policies in a table.
        *   **Features**: Search (client-side on current page data), Export (CSV, PDF).
    *   **Backend (`GET /api/v1/policy-list`)**:
        *   Returns paginated list of policies, formatting data to include some fields from the associated quote (e.g., `quote.email`, `quote.policyHolder`).
2.  **Actions on Policies**:
    *   **View**: Navigates to `/admin/policies/{quoteNumberOfAssociatedQuote}` (detail page - not explicitly read).
    *   **Edit**: Navigates to `/admin/policies/{quoteNumberOfAssociatedQuote}/edit` (detail edit page - not explicitly read).
        *   Likely calls `PUT /api/v1/policies/{policyId}`.
        *   Backend creates a `PolicyVersion` snapshot and updates the policy. If the policy is linked to a quote, it also updates the data on the quote and its relations.
    *   **Email**:
        *   Frontend fetches policy details: `GET /api/v1/quotes?quoteNumber={quoteNumber}` (as policy details are often tied to the original quote structure).
        *   Calls `POST /api/v1/email/send` with `{ to: policyEmail, type: 'policy', data: fetchedPolicyData }`.
        *   Backend generates PDF and sends email.
    *   **Delete**:
        *   Frontend prompts for confirmation.
        *   API call: `DELETE /api/v1/policies/{policyId}`.
        *   Backend deletes the policy and its related records (versions, payments, and if applicable, the associated quote and its children in a transaction).
        *   Frontend shows success toast and refreshes list.

### E. Viewing Transactions (`/admin/transactions`)

1.  **View Transactions List**:
    *   **Frontend**:
        *   Fetches all quotes: `GET /api/v1/quotes?allQuotes=true`.
        *   Transforms quotes into a "transaction" view (Transaction ID from Quote Number, customer name, date, premium amount, status, payment method derived from quote source or payment record).
        *   Displays transactions in a paginated table (client-side pagination).
        *   **Features**: Filter by time frame (last 7/30/90 days, custom range), Export (CSV, PDF).
        *   Displays summary metrics: Total Revenue, Completed Transactions (with % change from previous period).

### F. Admin Quote/Policy Creation (`/admin/create-quote/step1` onwards)

1.  **Initiate Creation**:
    *   **Frontend**: Admin clicks "Generate Policy" or "Create Quote" from dashboard, navigates to `/admin/create-quote/step1`.
2.  **Step-by-Step Data Entry**:
    *   **Frontend**: Admin proceeds through a multi-step form (`step1`, `step2` for event/venue, `step3` for policyholder, `step4` for review/finalize - structure inferred).
        *   Uses `QuoteContext` for state management, similar to customer flow.
        *   Step 1 (`/admin/create-quote/step1/page.tsx`): Admin enters initial quote details (state, event type, guests, date, email, coverages). "Calculate Quote" button triggers frontend premium calculation and UI update. "Continue" saves to `QuoteContext` and moves to next step.
    *   **Unlike customer flow, API calls to save partial data (`POST /quotes` or `PUT /quotes/{id}`) are likely deferred until a final "Save" or "Issue Policy" action at the end of the multi-step process.**
3.  **Finalize and Save/Issue**:
    *   **Frontend (e.g., at Step 4 - Review/Finalize)**:
        *   Admin reviews all entered information.
        *   Action to "Save Quote" or "Issue Policy".
        *   If "Save Quote":
            *   API call `POST /api/v1/quotes` with all data from `QuoteContext` and `source: "ADMIN"`.
            *   Backend sets quote `status` to `StepStatus.COMPLETE`.
        *   If "Issue Policy":
            *   API call `POST /api/v1/quotes` with data and `source: "ADMIN"`.
            *   Backend creates quote with `status: StepStatus.COMPLETE`.
            *   Frontend then immediately calls `POST /api/v1/policies/from-quote` with `{ quoteNumber: newlyCreatedQuoteNumber, forceConvert: true }`.
            *   Backend converts the quote to a policy.
            *   Policy email may be triggered.
    *   **Frontend**: Redirects to admin quotes/policies list or detail page.

### G. System Maintenance

1.  **Cleanup Policy Versions**:
    *   **Trigger**: This is currently only an API endpoint, no frontend UI exposed for this. Could be a cron job or manually triggered API call by an admin tool.
    *   **Backend (`POST /api/v1/admin/cleanup-policy-versions`)**:
        *   Fetches all policies and their versions.
        *   For each policy with >10 versions, deletes the oldest versions, keeping only the newest 10.

## 4. Core Backend Processes Supporting Workflows

These are recurring backend operations used across various workflows.

### A. Quote Data Management

*   **Creation (`POST /api/v1/quotes`)**: Stores initial quote data. Sets status based on source (Customer: STEP1, Admin: COMPLETE). Stores frontend-calculated premiums.
*   **Update (`PUT /api/v1/quotes/{quoteNumber}`)**: Merges new data. **Recalculates premiums if relevant fields (coverages, guest count) are modified.**
*   **Retrieval (`GET /api/v1/quotes?params...`)**: Fetches single or multiple quotes with various filters and relations.
*   **Deletion (`DELETE /api/v1/quotes/{quoteNumber}`)**: Removes quote and dependent data.

### B. Policy Data Management

*   **Creation from Quote (`POST /api/v1/policies/from-quote` using `policy.service.ts::createPolicyFromQuote`)**:
    *   Transactional: creates `Policy` entity, links to `Quote`, sets `quote.convertedToPolicy = true`, sets `quote.status = StepStatus.COMPLETE`.
*   **Direct Creation (`POST /api/v1/policies`)**: Creates a policy without a prior quote record (less common in current flows).
*   **Update (`PUT /api/v1/policies/{id}`)**: Updates policy data. Creates a `PolicyVersion` snapshot. If linked to a quote, updates are also propagated to the quote's data.
*   **Retrieval (`GET /api/v1/policies` or `GET /api/v1/policy-list`)**: Fetches single or list of policies. `/policy-list` is paginated and formats data for admin UI.
*   **Deletion (`DELETE /api/v1/policies/{id}`)**: Removes policy and dependents (versions, payments, associated quote if applicable).

### C. Premium Calculation Logic

*   **Frontend (`QuoteContext` & `/utils/constants.ts`)**:
    *   Initial quote calculation for both Customer and Admin quote generation (Step 1).
    *   Uses hardcoded premium values/mappings in `COVERAGE_LEVELS`, `LIABILITY_OPTIONS`, `LIQUOR_LIABILITY_PREMIUMS` from `constants.ts`.
*   **Backend (`/utils/quote.utils.ts` used by `PUT /api/v1/quotes/{quoteNumber}`)**:
    *   Recalculates premiums when a quote is updated via `PUT` if any of `coverageLevel`, `liabilityCoverage`, `liquorLiability`, or `maxGuests` change.
    *   Uses functions like `calculateBasePremium`, `calculateLiabilityPremium`, `calculateLiquorLiabilityPremium`. These functions likely mirror the logic or constants from the frontend's `constants.ts` to ensure consistency, although this direct mirroring needs to be confirmed by inspecting `quote.utils.ts`.

### D. Email Notifications (`email.service.ts`)

*   Triggered by `POST /api/v1/email/send`.
*   `sendQuoteEmail`: Uses `quoteEmailTemplate` for content. Sends plain HTML email.
*   `sendPolicyEmail`: Uses `policyEmailTemplate`. Calls `pdf.service.ts` to generate policy PDF, then sends email with PDF attachment.
*   Uses `nodemailer` with Gmail SMTP (credentials from environment variables).

### E. PDF Generation (`pdf.service.ts`)

*   `generatePolicyPdf`:
    *   Loads a base PDF template (`public/base.pdf`) and a logo (`public/logo.png`).
    *   Uses `jsPDF` to dynamically generate content for declaration pages (page 1 and 2) based on quote/policy data. (Note: The actual content generation logic in the provided `pdf.service.ts` was placeholder and would need to be fully implemented).
    *   Uses `pdf-lib` to merge the generated declaration pages with the base template PDF.
    *   Returns the final PDF as a Buffer.

This markdown file should now contain a comprehensive overview of the system's workflows.
