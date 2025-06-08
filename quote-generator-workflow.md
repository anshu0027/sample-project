# Frontend Quote Generation Workflow

This document outlines the step-by-step process of how a user generates a quote on the `/customer/quote-generator` page.

## 1. Initial Page Load and State Initialization

When a user navigates to `/customer/quote-generator`, the following occurs:

- **Component Mount:** The `QuoteGenerator` React component is rendered.
- **`useEffect` Hook (on initial mount):**
    - **Clear Previous Quote:** `localStorage.removeItem("quoteNumber")` is executed. This action ensures that any `quoteNumber` from a previous session is removed from the browser's local storage. This forces a fresh start for each visit, preventing the accidental loading or continuation of an old quote.
    - **Simulate Loading:** A `setTimeout` function runs for 200 milliseconds. After this brief delay, `setPageLoading(false)` is called. This updates the `pageLoading` state, which typically controls the visibility of a loading skeleton or spinner. Once `false`, the main form UI is displayed.
- **State Initialization:**
    - **`errors` (Local State):** Initialized as an empty object (`{}`). This state variable will hold any validation error messages that occur during form submission.
    - **`showQuoteResults` (Local State):** Initialized to `false`. This controls the visibility of the section displaying the calculated quote details, ensuring it's hidden initially.
    - **`showSpecialActivitiesModal` (Local State):** Initialized to `false`. This controls the visibility of a modal dialog related to special activities.
    - **`pageLoading` (Local State):** Initialized to `true`. This is used to show a loading indicator while the page is setting up.
    - **`state` and `dispatch` (from `useQuote` Context):** The component connects to the `QuoteContext`.
        - `state`: This object, provided by the context, holds all the data related to the quote form (e.g., `residentState`, `eventType`, `email`, `coverageLevel`, `totalPremium`, `eventDate`, `maxGuests`, `liquorLiability`, `covidDisclosure`, etc.).
        - `dispatch`: This function is used to send actions to the `QuoteContext`'s reducer, which in turn updates the `state`.

## 2. User Input Handling

As the user interacts with the form fields:

- **`onChange` Handlers:** Each input field (dropdowns, text inputs, date pickers, checkboxes) has an associated `onChange` event handler.
- **`handleInputChange(fieldName, value)`:** Most of these handlers call this generic function.
    - **Update Context State:** `dispatch({ type: "UPDATE_FIELD", field: fieldName, value: value })` is called. This action updates the specified `fieldName` in the global `QuoteContext` state with the new `value`.
    - **Clear Specific Error:** If the `errors` state object contains an error message for the `fieldName` that just changed, that specific error is removed (`delete newErrors[field]`). This provides instant feedback to the user, clearing error messages as they correct the input.
    - **Reset Quote Results Visibility:** If the `fieldName` is one that directly impacts the premium calculation (e.g., `coverageLevel`, `liabilityCoverage`, `liquorLiability`, `maxGuests`), `setShowQuoteResults(false)` is called. This action hides any previously calculated quote results, indicating that a parameter has changed and a recalculation is necessary.
- **Specific Input Handlers:**
    - **`handleDateChange` (and `handleDateChangeCorrected`):** These functions handle changes from the `DatePicker` component. They ensure the selected date is formatted to `YYYY-MM-DD` before dispatching the `UPDATE_FIELD` action to the context.
    - **`handleSpecialActivitiesChange`:**
        - If the "special activities" checkbox is checked, it calls `setShowSpecialActivitiesModal(true)`, which displays a warning modal to the user.
        - If unchecked, it dispatches an `UPDATE_FIELD` action to update the `specialActivities` boolean in the context.

## 3. Form Validation Process

Validation is triggered when the user attempts to calculate the quote or proceed.

- **`validateForm()` Function:** This function is called, typically by `handleCalculateQuote` or `handleContinue`.
- **Validation Checks Performed:**
    - `!state.residentState`: Error: "Please select your state of residence"
    - `!state.eventType`: Error: "Please select an event type"
    - `!state.maxGuests`: Error: "Please select the maximum number of guests"
    - `!state.eventDate`: Error: "Please select the event date"
        - If `state.eventDate` exists, further date-specific validations are performed using utility functions:
            - `!isDateInFuture(eventDate)`: Error: "Event date must be in the future"
            - `!isDateAtLeast48HoursAhead(eventDate)`: Error: "Event date must be at least 48 hours in the future"
            - `!isDateWithinTwoYears(eventDate)`: Error: "Event date must be within the next 2 years"
    - `!state.email`: Error: "Please enter your email address"
    - `state.coverageLevel === null`: Error: "Please select a coverage level"
    - `!state.covidDisclosure`: Error: "You must acknowledge the COVID-19 exclusion"
- **Error State Update:**
    - `setErrors(newErrors)`: The local `errors` state is updated with an object containing any validation messages. The keys of this object correspond to the field names.
- **Return Value:** The `validateForm()` function returns `true` if `Object.keys(newErrors).length === 0` (i.e., no validation errors were found), and `false` otherwise.

## 4. "Calculate Quote" Button Click (`handleCalculateQuote`)

This asynchronous function is executed when the user clicks the "Calculate Quote" button.

- **Step 1: Validate Form Data:**
    - `if (validateForm())` is executed. The form's current data is validated as described in the previous section.
- **Step 2: Handle Invalid Form:**
    - If `validateForm()` returns `false` (meaning there are validation errors):
        - **Display Error Toasts:** `Object.entries(errors).forEach(([, msg]) => toast.error(msg))` iterates through the validation messages stored in the `errors` state and displays each one as an error toast notification.
        - **Scroll to First Error:** The code attempts to find the first form element associated with an error and scrolls the page to bring it into view, helping the user quickly identify what needs correction.
- **Step 3: Handle Valid Form (Proceed with Quote Calculation & API Calls):**
    - If `validateForm()` returns `true`:
        - **Dispatch Calculation Action:** `dispatch({ type: "CALCULATE_QUOTE" })` is sent to the `QuoteContext`. This action signals the context's reducer to perform the necessary calculations for the quote based on the current state. The premium components (e.g., `basePremium`, `liabilityPremium`, `liquorLiabilityPremium`) are typically summed up to derive the `totalPremium`. The underlying premium values are sourced from constants defined in `utils/constants.ts` (e.g., `CORE_COVERAGE_PREMIUMS`, `LIABILITY_COVERAGE_PREMIUMS`).
        - **Asynchronous Operations (`setTimeout(async () => { ... }, 0)`):** The subsequent API interactions are wrapped in a `setTimeout` with a zero millisecond delay. This technique defers the execution of the enclosed code to the next cycle of the JavaScript event loop. This allows the UI to update (e.g., render a loading spinner if one were triggered by a state change before this `setTimeout`) before potentially long-running network requests are initiated.
        - **Inside the `setTimeout` Callback:**
            - **Create Quote API Call:** An HTTP POST request is made to `${apiUrl}/quotes` with the current quote data from the context state.
                - **On Success (Quote Created):**
                    - **Store Quote Number:** `localStorage.setItem("quoteNumber", data.quoteNumber)` saves the `quoteNumber` received from the API response into local storage.
                    - **Update Context:** `dispatch({ type: "UPDATE_FIELD", field: "quoteNumber", value: data.quoteNumber })` updates the `quoteNumber` in the `QuoteContext` state.
                    - **Show Results:** `setShowQuoteResults(true)` is called, making the quote results section visible to the user.
                    - **Send Email API Call:** An HTTP POST request is made to `${apiUrl}/email/send` to send a notification email. The payload includes details like the recipient's email, subject, and the quote number.
                        - **Email Send Toasts:** A success or error toast is displayed based on the outcome of the email sending API call.
                - **On Failure (Quote Creation Fails):**
                    - An error toast is displayed, typically showing the error message received from the API.
                    - `setShowQuoteResults(false)` might be called to hide the results section if the quote creation itself failed.

This flow ensures that data is validated, calculations are performed, external services are contacted, and the user is kept informed via UI updates and notifications.
