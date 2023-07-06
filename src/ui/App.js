import { computed } from "nanostores";
import { CheckoutMode, mode, stepFlow, activeFormIds } from "../store";
import { CheckoutFlowOptions } from "../store/checkoutFlow";
import { CheckoutAuth } from "./CheckoutAuth";
import {
  BeginButton,
  ContinueShoppingButton,
  NextFormButton,
  SubmitCheckoutButton
} from "./checkoutButtons";
import { CheckoutForms } from "./CheckoutForms";
import { CheckoutProgress } from "./CheckoutProgress";
import { DebugCheckoutStateJson } from "./DebugCheckoutStateJson";
import { TextInput } from "./forms";
import { $$, nanoComponent, renderInto } from "./renderer";
import { showElementsWhen } from "./showElementsWhen";
import "./styles.css";

/* NOTES:

This is a little vanilla JS app with nanostores

- `store.js` encapsulates the core state management and logic
  - it provides all mutable and computed state via nanostores
  - it manages state flow using `machine.js`
  - it uses `formStore` to create observable stores for each subform
- `machine.js` provides the state machine definition
  - exports possible `CheckoutMode`s 
  - exports `sendEvent` function that controls how modes can change
- `renderer.js` provides a 1-line `nanoComponent` function 
that updates innerHTML whenever the source value changes
- Components here are setup(el, props) functions
  - typical pattern is: 
    - render all parts into inner HTML
    - select rendered elements
    - listen to elements -> update store
    - subscribe to store -> update elements

*/

// #region components
export function App() {
  renderInto("#app", `<div id="main" class="p-2"/>`);
  const mainEl = $$("#main");
  Main(mainEl);
}

function Main(el) {
  renderInto(el, () => {
    return `<div>
      <div class="flex items-center">
        <div class="flex-1">
          <h1 class="mt-2 mb-0 pb-0 text-4xl font-extrabold">
            nanostore checkout
          </h1>
          <code class="mode mb-8"></code>
        </div>
        <div class="flex items-center gap-2">
          Steps: 
            <!--<input type="number" min="2" max="3" value="3" placeholder="steps" class="steps-select input input-bordered" />-->
            <select class="steps-select select w-full max-w-xs">
            ${CheckoutFlowOptions.map(
              ({ name, value }) =>
                `<option value="${value}" ${
                  value === "three-step" ? "selected" : ""
                }>${name}</option>`
            ).join("")}              
            </select>          
        </div>
      </div>
      <div class="auth">
      </div>      
      <div class="step-flow"></div>
      <div class="shopping card bg-base-300 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">You are shopping</h3>
          <p>There are 3 items in your cart</p>
          <div class="card-actions">
            <button class="begin btn btn-primary">Begin Checkout</button>
          </div>
        </div>
      </div>
      <div class="forms flex flex-col was-flex-wrap justify-center my-12"></div>
    
      <h3 class="complete p-12 rounded-xl text-4xl font-bold text-center bg-success text-success-content">Checkout complete!</h3>
      <div class="my-4 w-full flex space-between p-2 gap-2">
        <div class="flex-1 flex gap-2">
          <button class="previous btn btn-ghost">Back</button>  
          <button class="continue btn ">Continue shopping</button>          
        </div>
        <button class="next btn btn-primary">Next</button>
        <button class="submit btn btn-success">Submit checkout</button>
      </div>
      <div class="mt-6 p-4 card shadow-xl bg-base-300">
        <h2 class="mt-2 text-3xl font-extrabold">State:</h2>
        <pre class="bgm-base-100 m-1 p-4 rounded-lg"><code class="state-json text-sm"></code></pre>
      </div>
    </div>`;
  });

  DebugCheckoutMode(el.querySelector(".mode"));
  CheckoutAuth(el.querySelector(".auth"));
  CheckoutProgress(el.querySelector(".step-flow"));
  TextInput(el.querySelector(".steps-select"), stepFlow);

  BeginButton(el.querySelector(".begin"));

  CheckoutForms(el.querySelector(".forms"));

  NextFormButton(el.querySelector(".next.btn"), {});
  NextFormButton(el.querySelector(".previous.btn"), { increment: -1 });

  SubmitCheckoutButton(el.querySelector(".submit"));
  ContinueShoppingButton(el.querySelector(".continue"));
  DebugCheckoutStateJson(el.querySelector(".state-json"));

  showElementsWhen(
    [el.querySelector(".shopping")],
    mode,
    CheckoutMode.Shopping
  );

  // showElementsWhen(
  //   [el.querySelector(".review")],
  //   computed([mode, activeFormIds], (mode, activeFormIds) => {
  //     return (
  //       mode === CheckoutMode.Requirements && activeFormIds.includes("review")
  //     );
  //   })
  // );

  showElementsWhen(
    [el.querySelector(".complete")],
    mode,
    CheckoutMode.NotifyingCheckoutComplete
  );

  const reviewEl = el.querySelector(`[data-form="review"]`);

  renderInto(
    reviewEl.querySelector(".form-fields"),
    `<div class="p-4">          
    <p>Subtotal 20.00</p>
    <p>Shipping 4.00</p>
    <p class="font-bold">Total 24.00</p>
  </div>`
  );
}

function DebugCheckoutMode(el, props) {
  nanoComponent(el, mode, (value) => {
    return `Mode: ${value}`;
  });
}
