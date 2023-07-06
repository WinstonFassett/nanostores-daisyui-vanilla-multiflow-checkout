import { computed } from "nanostores";
import { nanoComponent } from "./renderer";
import {
  mode,
  activeFormIds,
  contact,
  shipping,
  billing,
  completedSteps,
  stepFlowConfig,
  tabView2,
  selectedTabViewId,
  selectedTabView,
  step
} from "../store";

export const forms = { contact, shipping, billing };

export function DebugCheckoutStateJson(el) {
  const json = computed(
    [
      mode,
      activeFormIds,
      step,
      stepFlowConfig,
      completedSteps,
      // tabView2,
      selectedTabViewId,
      selectedTabView,
      contact.fields,
      shipping.fields,
      billing.fields
    ],
    (
      mode,
      activeFormIds,
      step,
      stepFlowConfig,
      completedSteps,
      // tabView2,
      selectedTabViewId,
      selectedTabView,
      contact,
      shipping,
      billing
    ) => {
      return {
        mode,
        contact,
        shipping,
        billing,
        activeFormIds,
        selectedTabViewId,
        selectedTabView,
        step,
        stepFlowConfig,
        completedSteps
        // tabView2
      };
    }
  );
  nanoComponent(el, json, (data) => {
    return JSON.stringify(
      data,
      function replacer(key, value) {
        // prevent circular references breaking json
        if (["ancestors", "parent"].includes(key)) return;
        return value;
      },
      4
    );
  });
}
