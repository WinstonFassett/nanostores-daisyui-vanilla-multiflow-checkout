export enum AuthMode {
  Initializing = "initializing",
  AlreadySavedMode = "started-in-saved-mode",
  AwaitingEmail = "awaiting-email",
  FetchingEmailCheck = "fetching-email-check",
  AwaitingOtp = "awaiting-otp",
  InvalidOtp = "invalid-otp",
  FetchingResendOtp = "fetching-resend-otp",
  FailedResendOtp = "failed-resend-otp",
  FetchingOtpValidation = "fetching-otp-validation",
  ContinuingAsSaved = "continuing-as-saved",
  ContinuingAsGuest = "continuing-as-guest"
}

export const flow = {
  [AuthMode.Initializing]: {
    gotUser: AuthMode.AlreadySavedMode,
    noUser: AuthMode.AwaitingEmail
  },
  [AuthMode.AwaitingEmail]: {
    gotEmail: AuthMode.FetchingEmailCheck
  },
  [AuthMode.FetchingEmailCheck]: {
    sentOtp: AuthMode.AwaitingOtp,
    unrecognized: AuthMode.ContinuingAsGuest
  },
  [AuthMode.AwaitingOtp]: {
    submitOtp: AuthMode.FetchingOtpValidation
  },
  [AuthMode.FetchingOtpValidation]: {
    validOtp: AuthMode.ContinuingAsSaved,
    invalidOtp: AuthMode.InvalidOtp
  }
};
