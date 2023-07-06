import { computed } from "nanostores";
import {
  mode,
  CheckoutMode,
  sendEvent,
  canCheckout,
  skip,
  $canSkip,
  activeFormsAreValid
} from "../store";
import { showElementsWhen } from "./showElementsWhen";

export function BeginButton(el) {
  showElementsWhen(el, mode, CheckoutMode.Shopping);
  el.querySelector(".begin");
  el.addEventListener("click", () => {
    sendEvent("start-checkout");
  });
}

export function NextFormButton(nextButtonEl, { increment = 1 }) {
  const visible = computed(
    [$canSkip(increment), mode, activeFormsAreValid],
    (canSkip, mode, activeFormsAreValid) => {
      console.log({ canSkip, mode, activeFormsAreValid });
      return (
        mode === CheckoutMode.CompletingRequirements &&
        canSkip &&
        (increment < 0 || activeFormsAreValid)
      );
    }
  );
  showElementsWhen(nextButtonEl, visible);
  nextButtonEl.addEventListener("click", (ev) => {
    ev.preventDefault();
    console.log("click next");
    skip(increment);
  });
}

export function SubmitCheckoutButton(el) {
  mode.subscribe((mode) => {
    el.style.display =
      mode === CheckoutMode.CompletingRequirements ? "" : "none";
  });
  canCheckout.subscribe((value) => {
    el.disabled = !value;
  });
  el.addEventListener("click", (ev) => {
    sendEvent("checkout");
  });
}
export function ContinueShoppingButton(el) {
  mode.subscribe((mode) => {
    el.style.display = [
      CheckoutMode.CompletingRequirements,
      CheckoutMode.NotifyingCheckoutComplete
    ].includes(mode)
      ? ""
      : "none";
  });
  el.addEventListener("click", (ev) => {
    sendEvent("continue");
  });
}
