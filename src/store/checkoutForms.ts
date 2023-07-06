import { map, computed } from "nanostores";

/* eslint-disable @typescript-eslint/no-use-before-define */
export const contact = formStore({ email: "", first: "", last: "" }, "contact");
export const shipping = formStore({ zip: "" }, "shipping");
export const billing = formStore({ card: "" }, "billing");
export const review = formStore({}, "review");
export const parts = [contact, shipping, billing];
export const forms = { contact, shipping, billing, review };

export function formStore(initialState: Record<string, any>, id: string) {
  // mutable state
  const store = map(initialState);

  // computed state
  const invalidFields = computed([store], (data) => {
    const invalid = {} as Record<string, boolean>;
    Object.keys(data).forEach((key) => {
      const { [key]: value } = data;
      if (!value) {
        invalid[key] = true;
      }
    });
    return invalid;
  });
  const valid = computed(
    invalidFields,
    (invalids) => Object.keys(invalids).length === 0
  );
  // state stores
  return {
    id,
    fields: store,
    invalidFields,
    valid
  };
}
