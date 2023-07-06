import { renderInto } from "./renderer";
import {
  mode as checkoutMode,
  CheckoutMode,
  tabView2,
  selectedTabViewId,
  activeFormsAreValid,
  canCheckout
} from "../store";
import { computed } from "nanostores";
export function CheckoutProgress(el) {
  renderInto(
    el,
    `
  <div>
    <ul class="checkout-steps steps w-full"></ul>
  </div>`
  );

  checkoutMode.subscribe((mode) => {
    el.style.display =
      mode === CheckoutMode.CompletingRequirements ? "" : "none";
  });

  const stepListEl = el.querySelector(".checkout-steps");
  let unsubs = [];
  const unsubChildren = () => {
    const pending = unsubs;
    unsubs = [];
    pending.forEach((unsub) => unsub());
  };
  const renderDeps = computed(
    [tabView2, selectedTabViewId, activeFormsAreValid, canCheckout],
    (tabsView2, selectedTabViewId, activeFormsAreValid, canCheckout) => {
      return [tabsView2, selectedTabViewId, activeFormsAreValid, canCheckout];
    }
  );
  renderDeps.subscribe(
    ([tabsView, currentTabViewId, activeFormsAreValid, canCheckout]) => {
      let hasIncomplete = false;
      // always rerender
      console.log({
        tabsView,
        currentTabViewId,
        activeFormsAreValid,
        canCheckout
      });
      unsubChildren();
      renderInto(
        stepListEl,
        tabsView.length === 1
          ? ""
          : tabsView
              .map((tab, i) => {
                console.log({ tab });
                const isCurrent = tab.id === currentTabViewId;
                if (!hasIncomplete && !tab.complete) {
                  hasIncomplete = true;
                }
                return `<li data-tab="${tab.id}" class="step ${
                  canCheckout || (tab.complete && !hasIncomplete)
                    ? "step-success"
                    : ""
                } ${
                  isCurrent ? "step-info" : tab.isNext ? "step-warning" : ""
                } ${isCurrent ? "font-bold" : ""}">
            <a class="capitalize" ${tab.complete ? `href="#"` : ``}>
              ${
                tab.flow.subflows
                  ? tab.flow.subflows.map((flow) => flow.name).join(" and ")
                  : tab.flow.name
              }
            </a> 
          </li>`;
              })
              .join("")
      );
      [...stepListEl.children].forEach((stepEl, index) => {
        const handler = (ev) => {
          const key = stepEl.getAttribute("data-tab");
          ev.preventDefault();
          selectedTabViewId.set(key);
        };
        stepEl.addEventListener("click", handler);
        unsubs.push(() => {
          stepEl.removeEventListener("click", handler);
        });
      });
    }
  );
}
