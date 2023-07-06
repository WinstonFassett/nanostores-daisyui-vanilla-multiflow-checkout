import { computed } from "nanostores";
import { appendChild, nanoComponent } from "./renderer";

export function Field(el, { key, form, setField }) {
  const { invalidFields } = form;
  const valid = computed([invalidFields], (data) => !data[key]);

  const inputEl = document.createElement("input");
  el.appendChild(inputEl);
  inputEl.className = "input input-sm input-bordered input-info";
  inputEl.placeholder = key;
  FieldInput(inputEl, { key, setField, form });

  const validationEl = appendChild(el, "span");
  validationEl.className = "text-right";
  nanoComponent(validationEl, valid, (data) => {
    return data ? `` : `<span class="text-warning text-sm"> Required!</span>`;
  });
}

export function FieldInput(el, { key, setField, form }) {
  form.fields.subscribe(({ [key]: value }) => {
    el.value = value;
  });
  el.addEventListener("input", (e) => {
    setField(key, e.target.value);
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

export function SelectInput(el, { $value, $options }) {
  $value.subscribe((value) => {
    el.value = value;
  });
  el.addEventListener("change", (e) => {
    $value.set(e.target.value);
  });
}
