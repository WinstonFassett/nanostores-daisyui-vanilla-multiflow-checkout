import { atom, computed, listenKeys } from "nanostores";
import { createAuthStore } from "./checkoutAuth";
import { createStepStore } from "./checkoutFlow";
import { billing, contact, parts, shipping } from "./checkoutForms";
import { CheckoutMode, getNextMode, initialMode } from "./checkoutModes";

export * from "./checkoutAuthModes";
export * from "./checkoutForms";
export * from "./checkoutModes";

// #region main checkout state machine
export const mode = atom(initialMode);
export const sendEvent = (event: string) => {
  const nextMode = getNextMode(mode.get(), event);
  if (nextMode) {
    mode.set(nextMode);
  }
};
// #endregion

export const auth = createAuthStore({
  mode,
  contact
});

// when contactFull is added/updated, update the form fields
listenKeys(auth, ["contactFull"], ({ contactFull }) => {
  const { email, first, last, card, zip } = contactFull as any;
  contact.fields.set({
    ...contact.fields.get(),
    email,
    first,
    last
  });
  shipping.fields.set({
    ...shipping.fields.get(),
    zip
  });
  billing.fields.set({
    ...billing.fields.get(),
    card
  });
});

export const canCheckout = computed(
  parts.map((part) => part.valid),
  (...validParts) => validParts.every((part) => !!part)
);
// #endregion

const stepStore = createStepStore({ parts });
const {
  step,
  completedSteps,
  nextStep,
  stepFlow,
  stepFlowConfig,
  tabView2,
  activeFormIds,
  activeFormsAreValid,
  selectedTabViewId,
  selectedTabView,
  activeFlowModel,
  $canSkip,
  skip
} = stepStore;

// #region state effects
mode.subscribe((mode) => {
  if (mode === CheckoutMode.NotifyingCheckoutComplete) {
    console.log("checked out");
    // reset tab when checkout happens
    const firstTabId = tabView2.get()[0].id;
    selectedTabViewId.set(firstTabId);
    //     parts.forEach((subform) => {
    //       const data = subform.fields.get();
    //       const newData = {};
    //       Object.keys(data).forEach((key) => {
    //         newData[key] = "";
    //       });
    //       console.log({ newData });
    //       subform.fields.set(newData);
    //     });
  }
});
// #endregion

console.log("store", { mode, contact, shipping, billing });

export {
  step,
  completedSteps,
  nextStep,
  stepFlow,
  stepFlowConfig,
  tabView2,
  activeFormIds,
  activeFormsAreValid,
  selectedTabViewId,
  selectedTabView,
  activeFlowModel,
  $canSkip,
  skip
};
