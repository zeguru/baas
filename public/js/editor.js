const API_BASE = "/baas/ruleset";

let editor;
let schema;
let currentRuleSetName = "";
let rules = []; // full array from backend
let selectedRuleIndex = -1;

let whenEditor, thenEditor, metaEditor;


const ruleSetSelect = document.getElementById("ruleSetSelect");
const loadSetBtn = document.getElementById("loadSetBtn");
const saveSetBtn = document.getElementById("saveSetBtn");
const ruleList = document.getElementById("ruleList");
const editorHolder = document.getElementById("editor_holder");
const duplicateRuleBtn = document.getElementById("duplicateRuleBtn");



// After init() completes, attach the listener
init().then(() => {
  // Handle RuleSet dropdown changes
  ruleSetSelect.addEventListener("change", () => {
    currentRuleSetName = ruleSetSelect.value;
    rules = [];
    selectedRuleIndex = -1;
    ruleList.innerHTML = "";

    // Clear editors
    whenEditor.setValue({});
    thenEditor.setValue({});
    metaEditor.setValue({ priority: 0 });

    // Optional: give feedback
    console.log(`RuleSet changed to: ${currentRuleSetName || "(none)"}`);
  });
});
async function init() {
  // Load schema
  const schemaRes = await fetch("./schema/editor-schema.json");
  schema = await schemaRes.json();

  // Extract sub-schemas
  const whenSchema = schema.properties.when;
  const thenSchema = schema.properties.then;
  const metaSchema = {
    type: "object",
    title: "Metadata",
    properties: {
      priority: schema.properties.priority,
    }
  };

  // Base JSON Editor options
  const opts = {
    disable_edit_json: false,
    disable_properties: false,
    disable_collapse: true,
    show_errors: "interaction",
    theme: "bootstrap5",
    object_layout: "normal", //or 'grid'
  };

  // Create sub-editors
  whenEditor = new JSONEditor(document.getElementById("whenTab"), {
    ...opts,
    schema: whenSchema,
    startval: {},
  });

  
  thenEditor = new JSONEditor(document.getElementById("thenTab"), {
    ...opts,
    schema: thenSchema,
    startval: {},
  });

  metaEditor = new JSONEditor(document.getElementById("metaTab"), {
    ...opts,
    schema: metaSchema,
    startval: {},
  });

  await loadRuleSets();

  loadSetBtn.addEventListener("click", loadSelectedRuleSet);
  saveSetBtn.addEventListener("click", saveCurrentRuleSet);
  duplicateRuleBtn.addEventListener("click", duplicateSelectedRule);

  }


// Load available rule sets
async function loadRuleSets() {
  const res = await fetch(API_BASE);
  const names = await res.json();
  ruleSetSelect.innerHTML = '<option value="">-- Select RuleSet --</option>';
  names.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    ruleSetSelect.appendChild(opt);
  });
  
}

// Load full ruleset array
async function loadSelectedRuleSet() {
  const name = ruleSetSelect.value;
  if (!name) return alert("Select a RuleSet first");
  currentRuleSetName = name;

  const res = await fetch(`${API_BASE}/${name}`);
  rules = await res.json();
  renderRuleList();
}

async function duplicateSelectedRule(){
  if (selectedRuleIndex == null || selectedRuleIndex < 0) {
    alert("Select a rule to duplicate first.");
    return;
    }

  // Deep clone the selected rule
  const clonedRule = structuredClone(rules[selectedRuleIndex]);

  // Optionally tweak something to avoid confusion
  if (clonedRule.then?.with?.message) {
    clonedRule.then.with.message += " (copy)";
    }
  if (clonedRule.priority !== undefined) {
    clonedRule.priority = clonedRule.priority + 1;
    }

  // Insert the clone right after the original
  rules.splice(selectedRuleIndex + 1, 0, clonedRule);

  // Update UI
  renderRuleList();

  // Automatically select the cloned rule
  selectRule(selectedRuleIndex + 1);
  }

// Render list of rules
function renderRuleList() {
  ruleList.innerHTML = "";
  rules.forEach((r, i) => {
    const label =
      r.then?.with?.message ||
      `Rule ${i + 1}` +
        (r.priority ? ` (Priority ${r.priority})` : "");

    const div = document.createElement("div");
    div.textContent = label;
    div.className = "rule-item list-group-item";
    if (i === selectedRuleIndex) div.classList.add("active");
    div.onclick = () => selectRule(i);
    ruleList.appendChild(div);
  });
}

// Select rule for editing
function selectRule(index) {
  selectedRuleIndex = index;
  renderRuleList();

  const rule = rules[index] || {};
  whenEditor.setValue(rule.when || {});
  thenEditor.setValue(rule.then || {});
  metaEditor.setValue({ priority: rule.priority ?? 0 });
}

// Save all rules back
async function saveCurrentRuleSet() {
  if (!currentRuleSetName) return alert("Select a RuleSet first");

  // capture current edited rule
  if (selectedRuleIndex >= 0) {
    const updatedRule = {
      when: whenEditor.getValue(),
      then: thenEditor.getValue(),
      priority: metaEditor.getValue().priority ?? 0,
    };
    rules[selectedRuleIndex] = updatedRule;
  }

  showLoader(true, `Clearing ${currentRuleSetName}...`);

  try {
    const clearRes = await fetch(`${API_BASE}/${currentRuleSetName}/clear`, {
      method: "POST",
    });
    if (!clearRes.ok) throw new Error("Clear failed");

    for (let i = 0; i < rules.length; i++) {
      const res = await fetch(`${API_BASE}/${currentRuleSetName}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules[i]),
      });
      if (!res.ok) console.warn(`Rule ${i + 1} failed`);
      showLoader(true, `Saved rule ${i + 1}/${rules.length}`);
      await new Promise((r) => setTimeout(r, 300));
    }

    showLoader(false);
    alert("✅ All rules saved!");
  } catch (e) {
    console.error(e);
    showLoader(false);
    alert("❌ Save failed");
  }
}


/* -----------------------------
   Simple full-page loader overlay
--------------------------------*/
function showLoader(show, message = "Loading...") {
  let loader = document.getElementById("loaderOverlay");

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loaderOverlay";
    loader.innerHTML = `
      <div id="loaderBox">
        <div class="spinner-border text-primary" role="status"></div>
        <div id="loaderMsg" style="margin-top: 10px; font-size: 0.9rem;"></div>
      </div>
    `;
    Object.assign(loader.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(255, 255, 255, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      flexDirection: "column",
    });
    Object.assign(loader.querySelector("#loaderBox").style, {
      textAlign: "center",
    });
    document.body.appendChild(loader);
  }

  loader.querySelector("#loaderMsg").textContent = message;
  loader.style.display = show ? "flex" : "none";
}
