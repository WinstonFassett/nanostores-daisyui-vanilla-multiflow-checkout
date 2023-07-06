import { computed, deepMap, listenKeys } from "nanostores";
import { AuthMode, flow } from "./checkoutAuthModes";
import { CheckoutMode } from "./checkoutModes";

/* eslint-disable @typescript-eslint/no-use-before-define */

export function getNextAuthMode(checkoutMode: CheckoutMode, authMode, event) {
  const modeConfig = flow[authMode];
  const targetMode = modeConfig?.[event];
  return targetMode ?? authMode;
}

function subscribeEmail(contact, fn) {
  let debounceTimeout;
  listenKeys(contact.fields, ["email"], ({ email }) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
      console.log("email changed", email);
      fn(email);
    }, 200);
  });
}

export function createAuthStore({ mode: checkoutMode, contact }) {
  const $checkoutAuth = deepMap({
    mode: AuthMode.Initializing,
    contactPartial: null,
    contactFull: null
  });
  const isSaved = computed($checkoutAuth, ({ contactFull }) => !!contactFull);
  const emailsChecked = new Set(); // private state

  initialize();
  return {
    ...$checkoutAuth,
    isSaved,
    submitOtp
  };

  function initialize() {
    subscribeEmail(contact, onEmail);
    // checkoutMode.subscribe((checkoutMode) => {
    //   if (checkoutMode === Modes.Checkout) {
    //     isSaved.set(true);
    //   }
    // });
    setTimeout(() => {
      sendEvent("noUser");
    }, 200);
  }

  function sendEvent(ev) {
    const currentCheckoutMode = checkoutMode.get();
    const currentAuthMode = $checkoutAuth.get().mode;
    $checkoutAuth.setKey(
      "mode",
      getNextAuthMode(currentCheckoutMode, currentAuthMode, ev)
    );
  }

  function onEmail(email) {
    if (!email || $checkoutAuth.get().mode !== AuthMode.AwaitingEmail) {
      return;
    }
    if (emailsChecked.has(email)) return;
    emailsChecked.add(email);
    if (email.startsWith("winston")) {
      sendEvent("gotEmail");
      setTimeout(() => {
        onEmailChecked({
          contactPartial: {
            first: "Winston",
            masked_phone: "***-***-1234"
          }
        });
        sendEvent("sentOtp");
      }, 100);
    }
  }

  function onEmailChecked({ contactPartial: { masked_phone, first } }) {
    console.log("email checked", { masked_phone });
    $checkoutAuth.setKey("contactPartial", { masked_phone, first });
  }

  function submitOtp(otp) {
    console.log("submitting OTP", otp);
    sendEvent("submitOtp");
    setTimeout(() => {
      onFetchedOtpValidation({
        valid: true,
        contactFull: {
          email: "winston.fassett.com",
          first: "Winston",
          last: "Fassett",
          zip: "75248",
          card: "4111 1111 1111 1111"
        }
      });
    }, 1000);
  }

  function onFetchedOtpValidation({ valid, contactFull }) {
    $checkoutAuth.setKey("contactFull", contactFull);
    sendEvent(valid ? "validOtp" : "invalidOtp");
  }
}
