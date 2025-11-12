const API_BASE = "/baas/ruleset";

let editor;
let schema;
let currentRuleSetName = "";
let rules = []; // full array from backend
let selectedRuleIndex = -1;

const ruleSetSelect = document.getElementById("ruleSetSelect");
const loadSetBtn = document.getElementById("loadSetBtn");
const saveSetBtn = document.getElementById("saveSetBtn");
const ruleList = document.getElementById("ruleList");
const editorHolder = document.getElementById("editor_holder");

init();

async function init() {
  // Load schema
  const schemaRes = await fetch("./schema/sample-schema.json");
  schema = await schemaRes.json();

  // Setup JSON Editor
  JSONEditor.defaults.options.theme = "bootstrap5";
  JSONEditor.defaults.options.iconlib = "bootstrap5";
  JSONEditor.defaults.options.object_layout = "grid";

  editor = new JSONEditor(editorHolder, {
    schema,
    disable_edit_json: true,
    disable_properties: false,
    disable_collapse: false,
    show_errors: "interaction",
    theme: "bootstrap5",
    startval: {},
    collapsed: true  // 👈 collapse all sections initially
    });


  // Populate ruleset dropdown
  await loadRuleSets();

  // Hook up buttons
  loadSetBtn.addEventListener("click", loadSelectedRuleSet);
  saveSetBtn.addEventListener("click", saveCurrentRuleSet);
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
  editor.setValue(rules[index]);
}

// Save all rules back
async function saveCurrentRuleSet() {
  if (!currentRuleSetName) {
    alert("No RuleSet selected!");
    return;
  }

  if (selectedRuleIndex >= 0) {
    // Save currently open rule
    rules[selectedRuleIndex] = editor.getValue();
  }

  showLoader(true, `Saving ${rules.length} rule(s)...`);

  try {
    
        // Step 1: Purge existing rules
    const clearRes = await fetch(`${API_BASE}/${currentRuleSetName}/clear`, {
      method: "POST",
      headers: { "accept": "*/*" },
    });

    if (!clearRes.ok) {
      showLoader(false);
      alert(`❌ Failed to clear ruleset "${currentRuleSetName}"`);
      return;
    }

    showLoader(true, `✅ Cleared old ruleset. Now saving ${rules.length} rule(s)...`);


    // Step 2:Sequentially send each rule
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const res = await fetch(`${API_BASE}/${currentRuleSetName}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      });

      if (!res.ok) {
        console.warn(`Rule ${i + 1} failed`);
        showLoader(true, `⚠️ Error saving rule ${i + 1}`);
      } else {
        showLoader(true, `✅ Saved rule ${i + 1}/${rules.length}`);
      }

      // small delay between requests (optional)
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    showLoader(false);
    alert("✅ All rules saved successfully!");
  } catch (err) {
    console.error(err);
    showLoader(false);
    alert("❌ Error saving ruleset");
  } finally {
    showLoader(false);
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
