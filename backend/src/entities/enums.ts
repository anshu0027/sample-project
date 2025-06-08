export enum StepStatus {
    STEP1 = "STEP1",
    STEP2 = "STEP2",
    STEP3 = "STEP3",
    COMPLETE = "COMPLETE",
  }
  
  export enum QuoteSource {
    CUSTOMER = "CUSTOMER", // Customer-generated quotes
    ADMIN = "ADMIN",       // Admin-generated quotes
  }
  
  export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
  }