export enum CheckoutMode {
  Shopping = "shopping",
  CompletingRequirements = "completing-checkout-requirements",
  NotifyingCheckoutComplete = "checked-out"
}

export const initialMode = CheckoutMode.CompletingRequirements;

export type CheckoutEvent = "start-checkout" | "checkout" | "continue";

export function getNextMode(mode: CheckoutMode, event: string) {
  if (mode === CheckoutMode.Shopping) {
    if (event === "start-checkout") {
      return CheckoutMode.CompletingRequirements;
    }
  }
  if (mode === CheckoutMode.CompletingRequirements) {
    if (event === "checkout") {
      return CheckoutMode.NotifyingCheckoutComplete;
    }
    if (event === "continue") {
      return CheckoutMode.Shopping;
    }
  }
  if (mode === CheckoutMode.NotifyingCheckoutComplete) {
    if (event === "continue") {
      return CheckoutMode.Shopping;
    }
  }
  return mode;
}
