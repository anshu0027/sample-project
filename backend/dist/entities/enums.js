"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.QuoteSource = exports.StepStatus = void 0;
var StepStatus;
(function (StepStatus) {
    StepStatus["STEP1"] = "STEP1";
    StepStatus["STEP2"] = "STEP2";
    StepStatus["STEP3"] = "STEP3";
    StepStatus["COMPLETE"] = "COMPLETE";
    StepStatus["EXPIRED"] = "EXPIRED";
})(StepStatus || (exports.StepStatus = StepStatus = {}));
var QuoteSource;
(function (QuoteSource) {
    QuoteSource["CUSTOMER"] = "CUSTOMER";
    QuoteSource["ADMIN"] = "ADMIN";
})(QuoteSource || (exports.QuoteSource = QuoteSource = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=enums.js.map