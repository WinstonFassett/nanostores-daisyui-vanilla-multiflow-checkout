import { nanoComponent, renderInto } from "./renderer";
import { computed, atom } from "nanostores";
import { auth, CheckoutMode, mode as checkoutMode, AuthMode } from "../store";

export function CheckoutAuth(el) {
  renderInto(
    el,
    `
  <div class="checkout-auth-pane bg-info p-4 mb-8 rounded text-info-content">
    <h3 class="text-xl">Checking out as **<span class="auth-type"></span>**</h3>
    <p><code><span class="auth-mode"></code></p>
    <dialog class="auth-dialog modal">
      <form method="dialog" class="modal-box bg-secondary">
        <h1 class="font-bold text-2xl">We recognize you <span class="first">[first]</span>!!!</h1>        
        <input class="input input-bordered my-6 rounded text-black" type="text" placeholder="Enter OTP" />
        <div class="mirror-otp"></div>
        <p class="py-4">Press ESC key or click the button below to continue as guest</p>
        <div class="modal-action">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn btn-ghost">Continue as guest</button>
          <div class="flex-1"></div>
        </div>
      </form>
    </dialog>
  </div>
  `
  );

  checkoutMode.subscribe((mode) => {
    el.style.display =
      mode === CheckoutMode.CompletingRequirements ? "" : "none";
  });
  const partialContactFirstName = computed(
    auth,
    ({ contactPartial }) => contactPartial?.first
  );
  nanoComponent(
    el.querySelector(".first"),
    partialContactFirstName,
    (name) => name
  );
  const authType = computed(auth.isSaved, (isSaved) =>
    isSaved ? "Saved" : "Guest"
  );
  const authMode = computed(auth, ({ mode }) => mode);
  const otpValue = atom("");

  nanoComponent(el.querySelector(".auth-type"), authType, (value) => value);

  const authModeEl = el.querySelector(".auth-mode");
  nanoComponent(authModeEl, authMode, (mode) => mode);

  const input = el.querySelector("input");
  TextInput(input, otpValue);
  nanoComponent(el.querySelector(".mirror-otp"), otpValue, (value) => value);

  const authDialog = el.querySelector(".auth-dialog");
  authMode.subscribe((mode) => {
    authDialog.open = mode === AuthMode.AwaitingOtp;
    if (mode === AuthMode.AwaitingOtp) {
      input.focus();
    }
  });
  otpValue.subscribe((value) => {
    if (value?.length > 4) {
      auth.submitOtp(value);
      otpValue.set("");
    }
  });
}

export function TextInput(el, store) {
  store.subscribe((value) => {
    el.value = value;
  });
  el.addEventListener("input", (e) => {
    store.set(e.target.value);
  });
}
