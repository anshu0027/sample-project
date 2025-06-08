# Frontend: API Response Handling for Quote Generation

This document details how the frontend, specifically the `handleCalculateQuote` function in `frontend/src/app/customer/quote-generator/page.tsx`, processes responses from the backend API calls for quote creation and email sending. This occurs after the form data has been successfully validated.

## Context

The operations described below are part of the `handleCalculateQuote` asynchronous function. They are executed after the `validateForm()` check passes. The core logic is wrapped in a `setTimeout(async () => { ... }, 0)` to allow UI updates before blocking network requests.

## 1. Quote Creation API Call (`POST ${apiUrl}/quotes`)

After dispatching `CALCULATE_QUOTE` to the local context, the frontend makes an API call to create the quote on the backend.

```typescript
// Inside handleCalculateQuote, after successful validation
try {
  const res = await fetch(`${apiUrl}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...state, source: 'CUSTOMER' }), // state from useQuote()
  });
  const data = await res.json();
  const newQuote = data.quote; // Expecting the quote object nested in 'quote' property
```

### Response Handling:

-   **Successful Quote Creation:**
    -   **Condition:** `if (res.ok && newQuote && newQuote.quoteNumber)`
        -   `res.ok`: Checks if the HTTP status code is successful (e.g., 200 OK or 201 Created).
        -   `newQuote && newQuote.quoteNumber`: Verifies that the backend response includes the `quote` object and that this object contains a `quoteNumber`.
    -   **Actions:**
        1.  **Store Quote Number:** `localStorage.setItem("quoteNumber", newQuote.quoteNumber);`
            *   The unique `quoteNumber` received from the backend is stored in the browser's local storage. This allows the quote number to persist across sessions or page reloads (though the current page logic clears `quoteNumber` from local storage on each fresh visit to `/customer/quote-generator`).
        2.  **Update Context:** `dispatch({ type: "UPDATE_FIELD", field: "quoteNumber", value: newQuote.quoteNumber });`
            *   The `quoteNumber` is updated in the global `QuoteContext`. This makes it accessible to other components and ensures the application state reflects the created quote.
        3.  **Display Quote Results:** `setShowQuoteResults(true);`
            *   This local state variable is set to `true`. This change in state triggers a re-render, making the "Quote Results" section of the page visible. This section typically displays the `totalPremium`, `coverageLevel`, and other pertinent details from the `QuoteContext`.
        4.  **Proceed to Send Email:** The logic then immediately moves to the email sending API call (see section 2).

-   **Failed Quote Creation:**
    -   **Condition:** The `else` block of the success check (i.e., `!res.ok`, or `newQuote` or `newQuote.quoteNumber` is missing).
    -   **Actions:**
        1.  **Display Error Toast:** `toast.error(Failed to create quote: ${data.error || "Unknown error"});`
            *   An error notification (toast) is displayed to the user.
            *   It attempts to use a specific error message from the backend's JSON response (`data.error`). If no specific error message is provided by the backend, it defaults to `"Unknown error"`.

-   **Catch Block for Quote Creation Fetch:**
    -   **Condition:** If the `fetch` call for quote creation itself fails (e.g., network error, server unreachable, DNS issue).
    -   **Actions:**
        1.  **Display Error Toast:** `toast.error("Failed to create quote.");`
            *   A generic error message is shown to the user.

## 2. Email Sending API Call (`POST ${apiUrl}/email/send`)

This API call is nested within the success block of the quote creation API call. It is only attempted if the quote was successfully created on the backend.

```typescript
// Inside the success block of quote creation
try {
  const emailRes = await fetch(`${apiUrl}/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: newQuote.email, // Using email from the newly created quote
      type: 'quote',
      data: newQuote,     // Sending the full newQuote object
    }),
  });
```

### Response Handling:

-   **Successful Email Sending:**
    -   **Condition:** `if (emailRes.ok)`
        -   `emailRes.ok`: Checks if the HTTP status code from the email sending API is successful.
    -   **Actions:**
        1.  **Display Success Toast:** `toast.success("Quotation email sent!");`
            *   A success notification is shown to the user, confirming that the quotation email has been dispatched (or at least accepted by the backend for sending).

-   **Failed Email Sending:**
    -   **Condition:** The `else` block (i.e., `!emailRes.ok`).
    -   **Actions:**
        1.  **Parse Error Response:** `const emailData = await emailRes.json();` (This line might be missing in the provided snippet but is typical).
        2.  **Display Error Toast:** `toast.error(Failed to send email: ${emailData.error || "Unknown error"});`
            *   An error toast is displayed. It attempts to use a specific error message from the email API's JSON response. If unavailable, it defaults to `"Unknown error"`.

-   **Catch Block for Email Sending Fetch:**
    -   **Condition:** If the `fetch` call for email sending itself fails.
    -   **Actions:**
        1.  **Display Error Toast:** `toast.error("Failed to send email.");`
            *   A generic error message related to email sending is shown.

## Summary of Frontend State Changes and UI Updates

Upon successful quote creation:

-   **`quoteNumber`:** The `quoteNumber` from the backend response is stored in `localStorage` and updated in the `QuoteContext`.
-   **`showQuoteResults` (Local State):** Set to `true`. This makes the quote results section (displaying premium, coverage, etc., based on data in `QuoteContext`) visible on the page.
-   **Toast Notifications:** The user receives toast notifications for:
    -   Success or failure of quote creation.
    -   Success or failure of email sending.

This sequence ensures that the frontend state is synchronized with the backend, the UI is updated to reflect the generated quote, and the user receives clear feedback regarding the outcome of both the quote creation and email notification processes.
