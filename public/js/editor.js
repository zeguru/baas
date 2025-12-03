const API_BASE = "/baas/ruleset";

let editor;
let schema;
let currentRuleSetName = "";
let rules = []; // full array from backend
let selectedRuleIndex = -1;

let whenEditor, thenEditor, metaEditor;


const ruleSetSelect = document.getElementById("ruleSetSelect");
const loadSetBtn = document.getElementById("loadSetBtn");
const updateAllBtn = document.getElementById("updateAllBtn");
const persistBtn = document.getElementById("persistBtn");

const ruleList = document.getElementById("ruleList");
const editorHolder = document.getElementById("editor_holder");
const duplicateRuleBtn = document.getElementById("duplicateRuleBtn");
const copyBtn = document.getElementById("copyBtn");
const pasteBtn = document.getElementById("pasteBtn");
const deleteBtn = document.getElementById("deleteBtn");


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
  updateAllBtn.addEventListener("click", updateCurrentRuleSet);
  duplicateRuleBtn.addEventListener("click", duplicateSelectedRule);
  persistBtn.addEventListener("click", persistCurrentRuleset);
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
    clonedRule.then.with.message += " (duplicate)";
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
async function updateCurrentRuleSet() {
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

    loadSelectedRuleSet();
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




//========COPY PASTE LOGIC

let copiedRule = null;

// Copy button
copyBtn.onclick = () => {
  if (selectedRuleIndex >= 0) {
    copiedRule = structuredClone(rules[selectedRuleIndex]);
    alert("Rule copied !\n\"" + copiedRule.then?.with?.message + "\"");
    }
  else {
    alert("No rule selected");
    }
};

  pasteBtn.addEventListener("click", pasteCopiedRuleToCurrentSet);
  deleteBtn.addEventListener("click", deleteSelectedRule);


async function pasteCopiedRuleToCurrentSet() {

  if (!copiedRule) {
    alert("No rule copied yet.");
    return;
  }

  if(selectedRuleIndex < 0){
    alert("Choose destination first");
    return;
    }

  // Deep clone to avoid mutating original
  const pastedRule = structuredClone(copiedRule);

  // Label it as pasted for clarity
  if (pastedRule.then?.with?.message) {
    pastedRule.then.with.message += " (copy)";
  }

  // Insert at the end or right after currently selected one
  const insertIndex = selectedRuleIndex != null ? selectedRuleIndex + 1 : rules.length;
  rules.splice(insertIndex, 0, pastedRule);

  // Refresh and select new rule
  renderRuleList();
  selectRule(insertIndex);
}


async function deleteSelectedRule() {
  if (selectedRuleIndex == null || selectedRuleIndex < 0) {
    alert("Select a rule to delete first.");
    return;
  }

  const ruleToDelete = rules[selectedRuleIndex];
  const confirmed = confirm("Delete this rule ?\n\"" +  ruleToDelete.then?.with?.message + "\"");
  if (!confirmed) return;

  // Remove from the rules array
  rules.splice(selectedRuleIndex, 1);

  // Update UI
  renderRuleList();

  // Reset or select the next available rule
  if (rules.length > 0) {
    const newIndex = Math.min(selectedRuleIndex, rules.length - 1);
    selectRule(newIndex);
  } else {
    selectedRuleIndex = null;
    // Optionally clear editor content
    if (window.editorWhen) editorWhen.destroy();
    if (window.editorThen) editorThen.destroy();
    if (window.editorMeta) editorMeta.destroy();
  }
}



//ADD NEW

const createBtn = document.getElementById("createRuleSetBtn");
const newRuleSetNameInput = document.getElementById("newRuleSetName");

createBtn.addEventListener("click", createEmptyRuleset);
newRuleSetNameInput.addEventListener("input", forceKebabCase);

async function forceKebabCase(){
  // Convert to lowercase and remove invalid chars
    newRuleSetNameInput.value = newRuleSetNameInput.value
      .toLowerCase()              // enforce lowercase
      .replace(/\s+/g, '-')       // replace spaces (one or more) with a single hyphen
      .replace(/[^a-z0-9-]/g, '') // allow ONLY a-z, 0–9, and hyphen
      .replace(/--+/g, '-')       // collapse multiple hyphens
  }


async  function createEmptyRuleset() {    //With a default rule !!!

  const nameOfRuleset = newRuleSetNameInput.value.trim();

  const defaultRule = {
    when: { all: [ { fact: "always", operator: "always", value: "true" } ] },
    then: { do: "validation", with: { break: true, message: "Default rule. Please add usefull rules" } },
    priority: 0
  };


  if (!nameOfRuleset) {
    alert("Please enter a ruleset name.");
    return;
    }

  try {
      //showLoader("Creating ruleset...");

      const response = await fetch(`${API_BASE}/${nameOfRuleset}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultRule)   // <— IMPORTANT: send as array of rules
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "Create failed");
        }

      alert(`Ruleset "${nameOfRuleset}" created.`);

    // Refresh dropdown
      await loadRuleSets();
      newRuleSetNameInput.value = "";
      } 
    catch (err) {
      alert("Error creating ruleset: " + err.message);
      //hideLoader();
      } 
    finally {
      hideLoader();
    }
  }


  async  function persistCurrentRuleset() {    //With a default rule !!!

    //const nameOfRuleset = newRuleSetNameInput.value.trim();
    if (!currentRuleSetName) return alert("Select a RuleSet first");

    try {

        const response = await fetch(`${API_BASE}/${currentRuleSetName}/db/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          //body: ""  
          });

        if (!response.ok) {
          const responseText = await response.text();
          const json = JSON.parse(responseText);
          console.log(json);
          throw new Error(json.message || "Persist failed");
          }

        alert(`Ruleset "${currentRuleSetName}" saved.`);

      // Refresh dropdown
        await loadRuleSets();
        } 
      catch (err) {
        alert(err);
        //hideLoader();
        } 
      finally {
        //hideLoader();
      }
    }