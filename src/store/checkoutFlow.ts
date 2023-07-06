import { atom, computed, Store } from "nanostores";
import { forms } from "./checkoutForms";

/* Step = leaf/atom, Flow = branch/molecule */
export type StepName = string;
export type FlowDef = FlowDef[] | StepName;
export type Keypath = (string | number)[];
export type StepFlowModel = {
  name: string;
  keypath: Keypath;
  pathId: string;
  flowDef: FlowDef;
  subflows?: StepFlowModel[];
  ancestors: StepFlowModel[];
  parent?: StepFlowModel;
  index?: number;
};

export type MultiFlowModel = {
  flowsById: Record<string, StepFlowModel>;
  subflowsByPath: Record<string, StepFlowModel>;
  subflowsByName: Record<string, StepFlowModel>;
};

const ROOT_FLOW_DEFS_BY_NAME: Record<string, FlowDef> = {
  "one-step": [["contact", "shipping", "billing"]],
  "two-step": [["contact", "shipping"], "billing"],
  "three-step": ["contact", "shipping", "billing"],
  "four-step": ["contact", "shipping", "billing", "review"]
};

export const CheckoutFlowOptions = Object.keys(
  ROOT_FLOW_DEFS_BY_NAME
).map((key) => ({ name: key, value: key }));

const INITIAL_STEP_FLOW = "two-step";

function getFlowName(flow: FlowDef): string {
  if (typeof flow === "string") return `${flow}`;
  return `[${flow.map(getFlowName).join("-")}]`;
}

function createModel(): MultiFlowModel {
  const subflowsByPath: Record<string, StepFlowModel> = {};
  const subflowsByName: Record<string, StepFlowModel> = {};
  const flowsById: Record<string, StepFlowModel> = {};

  const modelRoot: MultiFlowModel = {
    flowsById,
    subflowsByPath,
    subflowsByName
  };

  Object.keys(ROOT_FLOW_DEFS_BY_NAME).map((rootFlowId) => {
    const flowDef = ROOT_FLOW_DEFS_BY_NAME[rootFlowId];

    /* eslint-disable @typescript-eslint/no-use-before-define */
    const flowModel = createFlowModel(flowDef, {
      keypath: [rootFlowId],
      ancestors: []
    });

    return flowModel;
  });
  // console.log(JSON.stringify({ flows, flowsById }, null, 2));
  return modelRoot;

  function createFlowModel(
    flowDef: FlowDef,
    {
      keypath,
      ancestors
    }: {
      keypath: Keypath;
      ancestors: StepFlowModel[];
      parent?: StepFlowModel;
    }
  ) {
    const pathId = keypath.join(".");
    const name = getFlowName(flowDef);
    const flowModel: StepFlowModel = {
      name,
      ancestors,
      keypath,
      pathId,
      flowDef: flowDef
      // subflows: undefined
    };
    if (Array.isArray(flowDef)) {
      flowModel.subflows = flowDef.map((stepFlow: FlowDef, index) => {
        return createFlowModel(stepFlow, {
          keypath: keypath.concat(index),
          parent: flowModel,
          ancestors: [flowModel].concat(ancestors)
        });
      });
    }
    // flowsById[]
    subflowsByPath[pathId] = flowModel;
    subflowsByName[name] = flowModel;
    return flowModel;
  }
}
const FLOW_MODEL = createModel();

export function createStepStore({
  parts
}: {
  parts: { id: string; valid: Store<boolean> }[];
}) {
  // #region computed state
  const completedSteps = computed(
    parts.map((part) => part.valid),
    (...partValidity) =>
      parts.filter((part, i) => partValidity[i]).map(({ id }) => id)
  );
  const activeRootFlowName = atom(INITIAL_STEP_FLOW);
  const activeFlowDef = computed(
    activeRootFlowName,
    (key) => ROOT_FLOW_DEFS_BY_NAME[key]
  );
  const activeRootFlowModel = computed(activeRootFlowName, (key) => {
    // console.log("activeRoot", { key, FLOW_MODEL });
    return FLOW_MODEL.subflowsByPath[key];
  });
  const step = atom();

  const tabView2 = computed(
    [activeRootFlowModel, completedSteps, step],
    (activeFlowModel, completedSteps, activeStep) => {
      // console.log({ activeFlowModel, completedSteps, step: activeStep });
      let firstIncompleteIndex = -1;
      return activeFlowModel.subflows!.map((flowModel, index) => {
        console.log("check complete", index, flowModel, completedSteps);
        // assumes 2 levels max
        const complete = flowModel.subflows
          ? flowModel.subflows.every((subflow) =>
              completedSteps.includes(subflow.name)
            )
          : completedSteps.includes(flowModel.name);
        const active = activeStep === flowModel.name;
        if (!complete && firstIncompleteIndex === -1) {
          firstIncompleteIndex = index;
        }
        const isNext = index === firstIncompleteIndex;
        return {
          id: flowModel.name,
          index,
          flow: flowModel,
          active,
          complete,
          isNext
        };
      });
    }
  );
  // console.log("tabView2", tabView2.get());

  const selectedTabViewId = atom(tabView2.get()[0].id);
  activeRootFlowModel.subscribe((activeFlowModel) => {
    // console.log({ activeFlowModel });
    const step = activeFlowModel.subflows![0];
    // console.log({ newFirstStep: step });
    selectedTabViewId.set(step.name);
    // step.set(activeFlowModel[0]);
  });

  const selectedTabView = computed(
    [tabView2, selectedTabViewId],
    (tabs, selectedTabViewId) => {
      console.log({ tabs, selectedTabViewId });
      return tabs.find((it) => it.id === selectedTabViewId);
    }
  );

  const activeFormIds = computed([selectedTabView], (tabView) => {
    console.log({ tabView });
    const set = new Set<FormId>();
    if (tabView) {
      reduceActiveFormNames(tabView.flow.flowDef, set);
    }
    return Array.from(set);
    function reduceActiveFormNames(flowDef: FlowDef, set: Set<string>) {
      if (Array.isArray(flowDef)) {
        flowDef.map((subflow) => reduceActiveFormNames(subflow, set));
      } else {
        // console.log({ flowDef });
        set.add(flowDef);
      }
      return set;
    }
  });

  type FormId = keyof typeof forms;

  const activeFormsAreValid = (function () {
    const activeFormsAreValid = atom(false);
    const validateActiveForms = () => {
      const allFormsAreValid = activeFormIds
        .get()
        ?.map((formId) => forms[formId].valid?.get())
        .every((value) => value);
      console.log({ allFormsAreValid });
      activeFormsAreValid.set(allFormsAreValid);
    };
    let activeFormSubs: (() => void)[] | undefined = undefined;
    activeFormIds.subscribe((activeFormIds) => {
      validateActiveForms();
      activeFormSubs?.forEach((unsub) => unsub);
      activeFormSubs = activeFormIds.map((formId) => {
        return forms[formId]?.valid.subscribe(() => {
          validateActiveForms();
        });
      });
    });
    return activeFormsAreValid;
  })();

  const nextStep = computed(tabView2, (tabs) => {
    return tabs.find(({ isNext }) => isNext);
  });

  function $canSkip(increment = 1) {
    return computed(
      [selectedTabView, tabView2, activeFormIds],
      (tabView, tabList, activeFormIds) => {
        if (!tabView) return false;
        const targetIndex = tabView.index + increment;
        const isNonTerminal = targetIndex > -1 && targetIndex < tabList.length;
        return isNonTerminal;
      }
    );
  }
  function skip(increment = 1) {
    const tabView = selectedTabView.value;
    console.log("skip", tabView);
    if (!tabView) return;
    const tabList = tabView2.value;
    const targetIndex = tabView.index + increment;
    const targetTab = tabList![targetIndex];
    return selectedTabViewId.set(targetTab.id);
  }

  return {
    step,
    completedSteps,
    nextStep,
    stepFlow: activeRootFlowName,
    stepFlowConfig: activeFlowDef,
    tabView2,
    activeFormIds,
    activeFormsAreValid,
    selectedTabViewId,
    selectedTabView,
    activeFlowModel: activeRootFlowModel,
    $canSkip,
    skip
  };
}
