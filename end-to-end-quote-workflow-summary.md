# End-to-End Quote Calculation Workflow Summary

This document outlines the sequence of events from when a customer fills out the quote generation form on the frontend to when the quote is created on the backend and an email notification is dispatched. It consolidates information from frontend and backend workflow analyses.

## I. Frontend: User Interaction and Initial Processing (`/customer/quote-generator`)

1.  **Page Load & Initialization:**
    *   The `QuoteGenerator` React component is mounted.
    *   Upon component mount, `localStorage.removeItem("quoteNumber")` is called, ensuring any quote number from a previous session is cleared to start a fresh quote process.
    *   A brief (200ms) simulated page loading state is managed by `pageLoading`, after which the main form UI is displayed.
    *   The application's state is managed by:
        *   `QuoteContext` (via `useQuote()` hook): Holds all form field values (e.g., `residentState`, `eventType`, `email`, `coverageLevel`, calculated premiums like `totalPremium`).
        *   Local React component state: `errors` (for validation messages), `showQuoteResults` (to control visibility of the quote summary, initially `false`), `showSpecialActivitiesModal`.

2.  **Form Input by User:**
    *   The user interacts with various form fields (dropdowns, text inputs, date pickers, checkboxes) to provide their details.
    *   For each input change, `handleInputChange(fieldName, value)` is typically called:
        *   It dispatches an action (`{ type: "UPDATE_FIELD", field, value }`) to the `QuoteContext` reducer, updating the global state.
        *   If there was a validation error associated with the changed field, that error is cleared from the local `errors` state.
        *   If the changed field is one that impacts premium calculation (e.g., `coverageLevel`, `maxGuests`), `setShowQuoteResults(false)` is called to hide any outdated quote results.

3.  **"Calculate Quote" Button Click:**
    *   The user clicks the "Calculate Quote" button, triggering the asynchronous `handleCalculateQuote` function.
    *   **Client-Side Validation:**
        *   `validateForm()` is executed to check for mandatory fields (resident state, event type, max guests, event date, email, coverage level, COVID disclosure) and specific rules (e.g., event date must be in the future, at least 48 hours ahead, and within two years).
        *   **If Invalid:**
            *   The local `errors` state is updated.
            *   An error toast notification is displayed for each validation message.
            *   The page attempts to scroll to the first form field that has an error.
            *   The process stops here, awaiting user correction.
    *   **If Valid:**
        *   `dispatch({ type: "CALCULATE_QUOTE" })`: An action is dispatched to the `QuoteContext`.
            *   This is the primary point where **frontend premium calculations** occur. The context's reducer logic uses the current state values (e.g., `coverageLevel`, `liabilityCoverage`, `liquorLiability`, `maxGuests`) and predefined constants (from `utils/constants.ts`, e.g., `CORE_COVERAGE_PREMIUMS`, `LIABILITY_COVERAGE_PREMIUMS`) to calculate `basePremium`, `liabilityPremium`, `liquorLiabilityPremium`, and subsequently the `totalPremium`. These calculated values are updated in the `QuoteContext` state.

## II. Frontend to Backend: Quote Creation Request

4.  **API Call - Create Quote:**
    *   After successful validation and frontend premium calculation, the frontend initiates an asynchronous `fetch` request:
        *   **Endpoint:** `POST ${apiUrl}/quotes`
        *   **Headers:** `{'Content-Type': 'application/json'}`
        *   **Request Body (JSON):** Contains all data from the `QuoteContext` state (which now includes the frontend-calculated premiums like `totalPremium`, `basePremium`, etc.) and an added `source: "CUSTOMER"` field.

## III. Backend: Processing Quote Creation (`POST /api/v1/quotes`)

5.  **Request Reception & Initial Checks:**
    *   The Express.js router directs the request to the appropriate handler in `quote.routes.ts`.
    *   The `source` from the request body is used; `effectiveSource` is determined as `QuoteSource.CUSTOMER`.
    *   A basic validation ensures `fields.email` is present; if not, a `400 Bad Request` is returned.

6.  **User Management (TypeORM):**
    *   The system queries the `User` table for an existing user with the provided `fields.email`.
    *   If a user is not found, a new `User` entity is created with the email and any provided name/phone details, and then saved to the database.

7.  **Entity Preparation & Creation (TypeORM):**
    *   Data for various entities is prepared from the request payload (`fields`):
        *   `quoteData`: Includes `residentState`, `email`, `coverageLevel`, and all premium values sent from the frontend.
        *   `eventData` (if `eventType`, `eventDate`, `maxGuests` are present).
        *   `venueData` (if `venueName` is present, nested under `eventData`).
        *   `policyHolderData` (if `firstName` and `lastName` for the policyholder are present).
    *   A new `Quote` entity is created and populated:
        *   `quoteNumber`: Generated by `generateQuoteNumber()` (e.g., `QN12345678`).
        *   `status`: Set to `StepStatus.STEP1` for customer-generated quotes.
        *   `source`: Set to `QuoteSource.CUSTOMER`.
        *   `isCustomerGenerated`: Set to `true`.
        *   The found/created `User` entity is associated.
        *   If `eventData` was prepared, a new `Event` entity is created (potentially with a nested new `Venue` entity) and associated with the quote.
        *   If `policyHolderData` was prepared, a new `PolicyHolder` entity is created and associated with the quote.

8.  **Database Persistence:**
    *   `quoteRepository.save(newQuote)`: The newly created `Quote` entity, along with any cascaded new entities (User, Event, Venue, PolicyHolder), is persisted to the database using TypeORM.

9.  **Response to Frontend:**
    *   If saving is successful, the backend sends an HTTP `201 Created` response.
    *   **Response Body (JSON):**
        ```json
        {
          "message": "Quote saved successfully",
          "quoteNumber": "QN12345678", // The generated quote number
          "quote": { /* ... complete saved quote object ... */ } // Includes ID, and associated entities
        }
        ```

## IV. Frontend: Handling Quote Creation Response

10. **Process Successful Quote Creation:**
    *   The frontend receives the `201 Created` response and parses the JSON data.
    *   **Condition:** `res.ok && newQuote && newQuote.quoteNumber` is true.
    *   **Actions:**
        *   `localStorage.setItem("quoteNumber", newQuote.quoteNumber)`: The `quoteNumber` from the backend response is stored.
        *   `dispatch({ type: "UPDATE_FIELD", field: "quoteNumber", value: newQuote.quoteNumber })`: The `quoteNumber` is updated in the `QuoteContext`.
        *   `setShowQuoteResults(true)`: This state change makes the "Quote Results" section visible on the UI. This section displays data from the `QuoteContext`, including the now backend-confirmed `quoteNumber` and the previously frontend-calculated premiums.

11. **Process Failed Quote Creation:**
    *   If the API call was not `ok` or the expected data (`newQuote.quoteNumber`) is missing:
        *   An error toast notification is displayed (e.g., `Failed to create quote: ${data.error || "Unknown error"}`).
    *   If there was a network error during the `fetch` call itself, a generic "Failed to create quote." toast is shown.
    *   The process may effectively stop here for this attempt, awaiting user action or a retry.

## V. Frontend to Backend: Send Email Request

12. **API Call - Send Email (Conditional):**
    *   This step only occurs if the quote creation in Step IV was successful.
    *   An asynchronous `fetch` request is made:
        *   **Endpoint:** `POST ${apiUrl}/email/send`
        *   **Headers:** `{'Content-Type': 'application/json'}`
        *   **Request Body (JSON):**
            ```json
            {
              "to": "customer@example.com", // From newQuote.email
              "type": "quote",
              "data": { /* ... full newQuote object received from POST /quotes response ... */ }
            }
            ```

## VI. Backend: Processing Email Request (`POST /api/v1/email/send`)

13. **Request Reception & Validation (`email.routes.ts`):**
    *   The Express router directs the request to the email handler.
    *   The request body is destructured: `{ to, type = 'quote', data }`.
    *   Validation: If `to` or `data` is missing, a `400 Bad Request` is returned. If `type` is not 'quote' (or 'policy', for other flows), a `400 Bad Request` for invalid type is returned.

14. **Service Call (`email.routes.ts` to `email.service.ts`):**
    *   For `type === 'quote'`, the `sendQuoteEmail(to, data)` function from `email.service.ts` is invoked.

15. **Email Generation & Dispatch (`sendQuoteEmail` in `email.service.ts`):**
    *   `quoteEmailTemplate({ quoteNumber: data.quoteNumber, firstName: data.policyHolder?.firstName || 'Customer', totalPremium: data.totalPremium })` is called. This template function (from `../utils/emailTemplates.ts`) generates the email's `subject` and `html` content.
    *   A pre-configured `nodemailer` transporter (`transporter.sendMail(...)`) is used to send the email. Mail options include:
        *   `from`: `process.env.SMTP_EMAIL`
        *   `to`: The customer's email address.
        *   `subject`: Generated by the template.
        *   `html`: Generated by the template.

16. **Response to Frontend:**
    *   If `transporter.sendMail` is successful, the `email.routes.ts` handler sends an HTTP `200 OK` response.
    *   **Response Body (JSON):**
        ```json
        {
          "success": true,
          "message": "Email sent successfully."
        }
        ```
    *   If any error occurs during email sending, a `500 Internal Server Error` with an error message is returned.

## VII. Frontend: Handling Email Sending Response

17. **Process Successful Email Sending:**
    *   The frontend receives the `200 OK` response from the email API.
    *   A success toast notification "Quotation email sent!" is displayed to the user.

18. **Process Failed Email Sending:**
    *   If the email API call was not `ok`:
        *   An error toast notification is displayed (e.g., `Failed to send email: ${emailData.error || "Unknown error"}`).
    *   If there was a network error during the `fetch` call for email sending, a generic "Failed to send email." toast is shown.

## Key Data Handoffs & State Changes Summary:

*   **Frontend `QuoteContext`:** Central to the process. It's updated by user input, performs premium calculations, and is further updated with the `quoteNumber` from the backend.
*   **`localStorage` (Frontend):** The `quoteNumber` is stored here after successful quote creation.
*   **Frontend `POST /quotes` Request:** Carries all user-entered data and frontend-calculated premiums to the backend.
*   **Backend `Quote` Entity:** Represents the persisted state of the quote in the database, including its `status` (`StepStatus.STEP1`), generated `quoteNumber`, and associations with `User`, `Event`, etc.
*   **Backend `POST /quotes` Response:** Delivers the saved `quote` object (especially `quoteNumber`) back to the frontend, confirming creation.
*   **Frontend `POST /email/send` Request:** Transports the customer's email and the full `quote` object (as `data`) to the backend, enabling personalized email content.
*   **UI State (Frontend):**
    *   `showQuoteResults` (boolean) controls the visibility of the calculated quote summary section.
    *   Toast notifications provide immediate, asynchronous feedback to the user for both successful operations and errors encountered during API interactions.

This end-to-end sequence ensures that a customer's request for a quote is validated on the frontend, premiums are calculated, the quote is formally created and stored on the backend, and the customer receives an email notification, with appropriate feedback provided to the user throughout the process.
