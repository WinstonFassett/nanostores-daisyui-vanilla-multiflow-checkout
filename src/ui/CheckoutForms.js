import { computed } from "nanostores";
import {
  activeFormIds,
  CheckoutMode,
  completedSteps,
  forms,
  mode,
  selectedTabView,
  step,
  tabView2
} from "../store";
import { Field } from "./forms";
import { renderInto } from "./renderer";

export function CheckoutForms(formsEl) {
  Object.keys(forms).forEach((key, index) => {
    const form = forms[key];
    const formEl = document.createElement("div");
    formsEl.appendChild(formEl);
    CheckoutStepForm(formEl, { key, index, form });
  });
}
function CheckoutStepForm(el, { key, index, form }) {
  renderInto(
    el,
    `<div data-form="${key}" class="card bg-base-300 p-4 m-2">
      <h2 class="text-2xl flex items-center gap-2">
      <div class="step-number inline-block h-10 w-10  rounded-full flex justify-center items-center text-center"></div>
      <div class="flex-1 capitalize">
      ${key} 
      </div>
      </h2>
      <div class="form-fields flex gap-4 flex-wrap"></div>
  </div>`
  );
  const visible = computed(
    [mode, step, activeFormIds, step, selectedTabView, tabView2],
    (mode, step, activeFormIds, activeStepId, selectedTabView, tabView2) => {
      // console.log({ step, activeFormIds, selectedTabView, tabView2 });
      if (mode !== CheckoutMode.CompletingRequirements) {
        return false;
      }
      if (selectedTabView?.id === key) {
        return true;
      }
      if (activeFormIds.includes(key)) {
        return true;
      }
      // const selectedTabView.id === key
      const subflow = selectedTabView?.flow.flow;
      if (
        Array.isArray(subflow) &&
        subflow.some((subflowStep) => subflowStep.id === key)
      ) {
        return true;
      }
      return false;
    }
  );
  visible.subscribe((visible) => {
    el.style.display = visible ? "" : "none";
  });

  const stepNumberEl = el.querySelector(".step-number");
  CheckoutStepNumber(stepNumberEl, { key });

  const formFieldWrapperEl = el.querySelector(".form-fields");

  const initialFields = form.fields.get();
  function setField(name, value) {
    form.fields.setKey(name, value);
  }
  Object.keys(initialFields).forEach((key) => {
    const fieldValue = initialFields[key];
    const fieldEl = document.createElement("div");
    fieldEl.className = "form-control my-2";
    formFieldWrapperEl.appendChild(fieldEl);
    Field(fieldEl, { key, fieldValue, setField, form });
  });
}

function CheckoutStepNumber(el, { key }) {
  const $isComplete = computed([completedSteps], (completedSteps) => {
    return completedSteps.includes(key);
  });
  FormStatus(el, { key, $isComplete });
}

function FormStatus(el, { $isComplete }) {
  $isComplete.subscribe((isComplete) => {
    el.classList.remove(
      "bg-base-100",
      "bg-success",
      "text-success-content",
      "bg-warning",
      "text-warning-content"
    );
    if (isComplete) {
      el.classList.add("bg-success");
      el.classList.add("text-success-content");
    } else {
      el.classList.add("bg-base-100");
      el.classList.add("bg-warning");
      el.classList.add("text-warning-content");
    }
    renderInto(el, isComplete ? "✔" : "⬇");
  });
}

function StepNumber(el, { $isComplete }) {
  $isComplete.subscribe((isComplete) => {
    // console.log("stepNumber", { key, index, isComplete, completedSteps });
    el.classList.remove(
      "bg-base-100",
      "bg-success",
      "text-success-content",
      "bg-warning",
      "text-warning-content"
    );
    if (isComplete) {
      el.classList.add("bg-success");
      el.classList.add("text-success-content");
    }
    // else if (tab?.isNext) {
    //   stepNumberEl.classList.add("bg-warning");
    //   stepNumberEl.classList.add("text-warning-content");
    // }
    else {
      el.classList.add("bg-base-100");
    }
  });
}
