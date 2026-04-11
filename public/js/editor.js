const API_BASE = "/baas/ruleset";

let editor;
let schema;
let currentRuleSetName = "";
let rules = [];
let selectedRuleIndex = -1;

let draggedRuleIndex = null;

let whenEditor, thenEditor, metaEditor;

let unsavedChanges = false;

const ruleSetSelect = document.getElementById("ruleSetSelect");
// const loadSetBtn = document.getElementById("loadSetBtn");
const updateAllBtn = document.getElementById("updateAllBtn");
const persistBtn = document.getElementById("persistBtn");

const ruleList = document.getElementById("ruleList");
const editorHolder = document.getElementById("editor_holder");
const duplicateRuleBtn = document.getElementById("duplicateRuleBtn");

const sampleFiles = ['sample-netpay-calc', 'sample-utility-bill',  'sample-table-lookup', 'sample-good-life',  'sample-motor-insurance','sample-health-insurance','sample-loan-eligibility','sample-statistics', 'sample-survey'];

//INIT
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
    disable_array_reorder:true,
    show_errors: "interaction",
    theme: "bootstrap5",
    object_layout: "normal", //or 'grid'
    };


  // Create sub-editors
  whenEditor = new JSONEditor(document.getElementById("whenTab"), {
    ...opts,
    schema: whenSchema,
    startval: {all:[{ fact: "always", operator: "always",value: true}]}
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

    
  const tabIds = ['whenTab', 'thenTab', 'metaTab'];

  // Function to mark page dirty
  const markDirty = () => {
    unsavedChanges = true;
    updateActionButtons();
    console.log('User changed JSON!');
    };

  // Attach input listener to all relevant tabs (excludes try-it)
  tabIds.forEach(id => {
    const tabEl = document.getElementById(id);
    if (!tabEl) return; // skip missing elements
    tabEl.addEventListener('input', markDirty, true);
    });

  await loadRuleSets();

  // loadSetBtn.addEventListener("click", (e) => {
  //     loadSelectedRuleSet();
  //     updateActionButtons(false);
  //     unsavedChanges = false;
  //     });
  
  updateAllBtn.addEventListener("click", updateCurrentRuleSet);
  persistBtn.addEventListener("click", persistCurrentRuleset);
  }

// AFTER INIT. After init() completes, attach change listener on dropdown
init().then(() => {

  ruleSetSelect.addEventListener("change", () => {

  if (unsavedChanges) {
    if (!confirm("You have out-of-sync rules. Discard updates and switch ruleset?")) {
      ruleSetSelect.value = currentRuleSetName;
      return;
      }
    }

  //updateActionButtons(true);

  currentRuleSetName = ruleSetSelect.value;
  rules = [];
  selectedRuleIndex = -1;
  ruleList.innerHTML = "";

  whenEditor.setValue({});
  thenEditor.setValue({});
  metaEditor.setValue({ priority: 0 });

  loadSelectedRuleSet();
  unsavedChanges = false;
  updateActionButtons();

  });
});


//UTILITY FUNCTIONS 
function updateActionButtons() {
    if(unsavedChanges){
      persistBtn.disabled = true;
      updateAllBtn.disabled = false;
      rulesetActionsBtn.disabled = true;
      }
    else{
      persistBtn.disabled = false;
      updateAllBtn.disabled = true;
      rulesetActionsBtn.disabled = false;
      }
  }

// Select rule for editing
function selectRule(index) {

  console.log(`Selecting rule ${index + 1}`)

  if (unsavedChanges) {
    if (!confirm("You have unsaved changes. Proceed anyway ?")) {
      console.log("Do not proceed")
      return;
      }
    console.log("Proceed without saving");
    unsavedChanges = false;
    updateActionButtons();
    }

  selectedRuleIndex = index;
  renderRuleList();

  const rule = rules[index] || {};
  whenEditor.setValue(rule.when || {});
  thenEditor.setValue(rule.then || {});
  metaEditor.setValue({ priority: rule.priority ?? 0 });
  }

function reorderRules(fromIndex, toIndex) {
  const moved = rules.splice(fromIndex, 1)[0];
  rules.splice(toIndex, 0, moved);

  normalizeRulePriorities();

  // Preserve selection
  if (selectedRuleIndex === fromIndex) {
    selectedRuleIndex = toIndex;
  } else if (fromIndex < selectedRuleIndex && toIndex >= selectedRuleIndex) {
    selectedRuleIndex--;
  } else if (fromIndex > selectedRuleIndex && toIndex <= selectedRuleIndex) {
    selectedRuleIndex++;
  }

  unsavedChanges = true;
  updateActionButtons();
  renderRuleList();
  }

function normalizeRulePriorities() {
  const base = rules.length * 10;

  rules.forEach((rule, index) => {
    rule.priority = base - index * 10;
  });
}

function renderRuleList() {
  ruleList.innerHTML = "";

  rules.forEach((r, i) => {

    // Main rule item container
    const div = document.createElement("div");
    div.draggable = true;
    div.dataset.index = i;
    div.className = "rule-item list-group-item d-flex justify-content-between align-items-center";
    div.onclick = () => selectRule(i);

    div.addEventListener("dragstart", (e) => {
      draggedRuleIndex = i;
      div.classList.add("opacity-50");
      e.dataTransfer.effectAllowed = "move";
    });

    div.addEventListener("dragend", () => {
      draggedRuleIndex = null;
      div.classList.remove("opacity-50");
    });


    div.addEventListener("dragover", (e) => {
      e.preventDefault(); // required
      div.classList.add("border", "border-primary");
    });

    div.addEventListener("dragleave", () => {
      div.classList.remove("border", "border-primary");
    });

    div.addEventListener("drop", (e) => {
      e.preventDefault();
      div.classList.remove("border", "border-primary");

      const targetIndex = i;
      if (
        draggedRuleIndex === null ||
        draggedRuleIndex === targetIndex
      ) return;

      reorderRules(draggedRuleIndex, targetIndex);
    });

    // Left: number + message container
    const labelSpan = document.createElement("div");
    labelSpan.style.display = "flex";
    labelSpan.style.alignItems = "flex-start";
    labelSpan.style.gap = "0.25rem"; // space between number and message

    // Number
    const numberSpan = document.createElement("span");
    numberSpan.textContent = `${i + 1}.`;
    numberSpan.style.color = "#aaa";          // light gray
    numberSpan.style.fontStyle = "italic";
    numberSpan.style.fontWeight = "100";     // lighter weight
    numberSpan.style.flex = "0 0 auto"; // fix width, prevents wrapping

    // Message
    const msgSpan = document.createElement("span");
    msgSpan.style.flex = "1 1 auto"; // takes remaining width
    msgSpan.style.whiteSpace = "pre-wrap"; // wraps naturally
    msgSpan.textContent = r.then?.with?.message || `Rule ${i + 1}`;

    labelSpan.appendChild(numberSpan);
    labelSpan.appendChild(msgSpan);
    div.appendChild(labelSpan);

    // Right: buttons (only show for selected)
    if (i === selectedRuleIndex) {
      const btnContainer = document.createElement("div");
      btnContainer.className = "rule-buttons btn-group btn-group-sm";

      const duplicateBtn = document.createElement("button");
      duplicateBtn.className = "btn btn-sm duplicate-btn";
      duplicateBtn.title = "Clone Rule";
      duplicateBtn.innerHTML = "⧉";
      duplicateBtn.onclick = (e) => { e.stopPropagation(); duplicateSelectedRule(); };

      const copyBtn = document.createElement("button");
      copyBtn.className = "btn btn-sm  copy-btn";
      copyBtn.title = "Copy to another Ruleset";
      copyBtn.innerHTML = "📋";
      copyBtn.onclick = (e) => { e.stopPropagation(); copyRule(i); };

      const pasteBtn = document.createElement("button");
      pasteBtn.className = "btn btn-sm paste-btn";
      pasteBtn.title = "Paste from another Ruleset";
      pasteBtn.innerHTML = "📥";
      pasteBtn.onclick = (e) => { e.stopPropagation(); pasteCopiedRuleToCurrentSet(); };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm delete-btn";
      deleteBtn.title = "Delete Rule";
      deleteBtn.innerHTML = "❌";
      deleteBtn.onclick = (e) => { e.stopPropagation(); deleteSelectedRule(); };

      btnContainer.appendChild(duplicateBtn);
      btnContainer.appendChild(copyBtn);
      btnContainer.appendChild(pasteBtn);
      btnContainer.appendChild(deleteBtn);

      div.appendChild(btnContainer);
    }

    // Highlight selected
    if (i === selectedRuleIndex) div.classList.add("active");

    ruleList.appendChild(div);
  });
}


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

//RULESET ACTIONS
async function loadSelectedRuleSet() {
  const name = ruleSetSelect.value;
  if (!name) return alert("Select a RuleSet first");
  currentRuleSetName = name;

  const res = await fetch(`${API_BASE}/${name}`);
  rules = await res.json();

  renderRuleList();

  const facts = extractFactsFromRules(rules);
  const tryItObject = buildEmptyFactsObject(facts);

  const tryInput = document.getElementById("tryInput");
  if (tryInput) {
    tryInput.value = JSON.stringify(tryItObject, null, 2);
    }
  }


async function duplicateSelectedRule(){
  if (selectedRuleIndex == null || selectedRuleIndex < 0) {
    alert("Select a rule to duplicate.");
    return;
    }
  const clonedRule = structuredClone(rules[selectedRuleIndex]);

  if (clonedRule.then?.with?.message) {
    clonedRule.then.with.message += " (duplicate)";
    }
  if (clonedRule.priority !== undefined) {
    clonedRule.priority = clonedRule.priority + 1;
    }

  rules.splice(selectedRuleIndex + 1, 0, clonedRule);
  renderRuleList();
  selectRule(selectedRuleIndex + 1);

  unsavedChanges = true;
  updateActionButtons();
  }

async function updateCurrentRuleSet() {   //Sync rules

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
      showLoader(true, `Updating rule ${i + 1}/${rules.length}`);
      //await new Promise((r) => setTimeout(r, 20));  //only necessary for showing progress to the user
      }
    showLoader(false);
    //alert("All rules synchronized!");
    loadSelectedRuleSet();
    unsavedChanges = false;
    updateActionButtons();
    } 
  catch (e) {
    console.error(e);
    showLoader(false);
    alert("Update failed");
    }
  }




let copiedRule = null;

// reusable copy function that works for toolbar or inline buttons
function copyRule(index) {
  if (selectedRuleIndex == null || selectedRuleIndex < 0 || selectedRuleIndex >= rules.length) {
    alert("No rule selected");
    return;
    }
  copiedRule = structuredClone(rules[index]);
  alert("Rule copied!\n\"" + (copiedRule.then?.with?.message || `Rule ${index+1}`) + "\"");
  }


async function pasteCopiedRuleToCurrentSet() {
  if (!copiedRule) {
    alert("No rule copied yet.");
    return;
    }

  if (selectedRuleIndex < 0 && rules.length > 0) {
    alert("Choose destination first");
    return;
    }

  const pastedRule = structuredClone(copiedRule);

  // Label it as pasted/copied for clarity
  if (pastedRule.then?.with?.message) {
    pastedRule.then.with.message += " (copy)";
    }

  // Insert at the top for empty rulesets, otherwise right after the selected rule.
  const insertIndex = selectedRuleIndex >= 0 ? selectedRuleIndex + 1 : 0;
  rules.splice(insertIndex, 0, pastedRule);
  normalizeRulePriorities();

  // Refresh and select new rule
  renderRuleList();
  selectRule(insertIndex);
  unsavedChanges = true;
  updateActionButtons();
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
  renderRuleList();

  // Reset or select the next available rule
  if (rules.length > 0) {
    const newIndex = Math.min(selectedRuleIndex, rules.length - 1);
    selectRule(newIndex);
    } 
  else {
    selectedRuleIndex = null;
    // Optionally clear editor content
    if (window.editorWhen) editorWhen.destroy();
    if (window.editorThen) editorThen.destroy();
    if (window.editorMeta) editorMeta.destroy();
    }
  unsavedChanges = true;
  updateActionButtons();
  }

const createBtn = document.getElementById("createRuleSetBtn");
const newRuleSetNameInput = document.getElementById("newRuleSetName");
createBtn.addEventListener("click", createEmptyRuleset);
newRuleSetNameInput.addEventListener("input", forceKebabCase);

async function forceKebabCase(){
  newRuleSetNameInput.value = newRuleSetNameInput.value
    .toLowerCase()              
    .replace(/\s+/g, '-')       // replace spaces (one or more) with a single hyphen
    .replace(/[^a-z0-9-]/g, '') // allow ONLY a-z, 0–9, and hyphen
    .replace(/--+/g, '-')       // collapse multiple hyphens
  }


async  function createEmptyRuleset() {    //With a default rule !!!

  const nameOfRuleset = newRuleSetNameInput.value.trim();

  const defaultRule = {
    when: { all: [ { fact: "always", operator: "always", value: "true" } ] },
    then: { do: "validation", with: { break: true, message: "Default rule. Please add useful rules" } },
    priority: 0
    };

  if (!nameOfRuleset) {
    alert("Please enter a ruleset name ");
    return;
    }

  try {
    const response = await fetch(`${API_BASE}/${nameOfRuleset}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultRule)   // <— IMPORTANT: send as array of rules
      });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(txt || "Create failed");
      }

    alert(`Ruleset "${nameOfRuleset}" created successfully`);

  // Refresh dropdown
    await loadRuleSets();
    ruleSetSelect.value = nameOfRuleset;
    ruleSetSelect.dispatchEvent(new Event("change"));
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


async  function persistCurrentRuleset() {  

  if (!currentRuleSetName) return alert("Select a RuleSet first");

  if (sampleFiles.includes(currentRuleSetName)) {
    alert("Overwriting sample RuleSets is not allowed");
    return;
    }

  if (unsavedChanges) {
    if (!confirm("You have out-of-sync rules. Proceed Anyway ?")) {
      return;
      }
    }

  try {
    const response = await fetch(`${API_BASE}/${currentRuleSetName}/db/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      });

    if (!response.ok) {
      const responseText = await response.text();
      const json = JSON.parse(responseText);
      console.log(json);
      throw new Error(json.message || "Persist failed");
      }

    alert(`Ruleset "${currentRuleSetName}" saved.`);

    await loadRuleSets();
    } 
  catch (err) {
    alert(err);
    } 
  finally {
    }
}


//MISC FUNCTIONS
function extractDerivedFacts(rules) {
  const derived = new Set();
  rules.forEach(rule => {
    const item = rule?.then?.with?.item;
    if (item) {
      derived.add(item);
      }
    });
  return derived;
  }


function extractFactsFromRules(rules) {
  const facts = new Set();
  const derivedFacts = extractDerivedFacts(rules);

  function scan(node) {
    if (!node || typeof node !== "object") return;

    if (node.fact) {
      const fact = node.fact;
      // Ignore internal / engine-managed facts and derived facts
      if ( fact === "always" || fact.startsWith("session.") || derivedFacts.has(fact)) {
        return;
        }
      facts.add(fact);
      return;
      }

    if (Array.isArray(node.all)) node.all.forEach(scan);
    if (Array.isArray(node.any)) node.any.forEach(scan);
    }

  rules.forEach(rule => scan(rule.when));
  return Array.from(facts);
  }


function buildEmptyFactsObject(facts) {
  return facts.reduce((obj, fact) => {
    obj[fact] = "";
    return obj;
    }, {});
  }


const readMeDoc = document.getElementById('viewReadmeAction')

const readmeModalEl = document.getElementById('rulesetReadmeModal');
const readmeModal = new bootstrap.Modal(readmeModalEl);
const readmeContent = document.getElementById('rulesetReadmeContent');
const readmeTitle = document.getElementById('rulesetReadmeModalTitle');

readMeDoc.addEventListener('click', async () => {

  console.log("ReadMe clicked");

  const id = ruleSetSelect.value;
  if (!id) return;

    // Dynamically update modal title
  const selectedName = ruleSetSelect.options[ruleSetSelect.selectedIndex].text;
  readmeTitle.textContent = `${selectedName} README`;
  readmeContent.innerHTML = '<em>Loading documentation…</em>';
  readmeModal.show();

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(currentRuleSetName)}/readme`);
    const { read_me } = await res.json();
    readmeContent.innerHTML = marked.parse(
      read_me || '_No documentation available._'
      );
    } 
  catch {
    readmeContent.innerHTML =
      '<span class="text-danger">Failed to load README</span>';
    }
  });


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
