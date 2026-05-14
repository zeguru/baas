
document.addEventListener("DOMContentLoaded", () => {
  
  const API_BASE = "/baas/calculator";

  const tryInput = document.getElementById("tryInput");
  const tryOutput = document.getElementById("tryOutput");
  const runTryBtn = document.getElementById("runTryBtn");
  const resetTryBtn = document.getElementById("resetTryBtn");
  const ruleSetSelect = document.getElementById("ruleSetSelect");
  const activeRuleSetLabel = document.getElementById("activeRuleSet");

  if (activeRuleSetLabel) activeRuleSetLabel.textContent = ruleSetSelect?.value || "—";

  // Update active ruleset display whenever user changes dropdown
  if (ruleSetSelect) {
    ruleSetSelect.addEventListener("change", () => {
      if (activeRuleSetLabel) {
        activeRuleSetLabel.textContent = ruleSetSelect.value || "—";
      }
    });
  }

  // Reset button
  if (resetTryBtn) {
    resetTryBtn.addEventListener("click", () => {
      // tryInput.value = `{}`;
      tryOutput.textContent = "";
      loadSelectedRuleSet();
    });
  }

  // Test Run button
  if (runTryBtn) {
    runTryBtn.addEventListener("click", async () => {
      const ruleSetName = ruleSetSelect?.value;
      if (!ruleSetName) {
        alert("Please select a RuleSet first.");
        return;
      }

      if (activeRuleSetLabel) activeRuleSetLabel.textContent = ruleSetName;

      let payload;
      try {
        payload = JSON.parse(tryInput.value);
      } catch (err) {
        alert("Invalid JSON input. Please fix and try again.");
        return;
      }

      document.getElementById("loaderMsg").innerText = "Running test...";
      document.getElementById("loaderOverlay").style.display = "flex";


      try {
        const response = await fetch(
          `${API_BASE}/${ruleSetName}/compute`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );

        const result = await response.json();
        tryOutput.textContent = JSON.stringify(result, null, 2);

        // Highlight in red if stopped=true
        if (result.stopped === true) {
          tryOutput.style.color = "red";
        } else {
          tryOutput.style.color = "black"; // reset if not stopped
        }

      } catch (err) {
        tryOutput.textContent = `Error: ${err.message}`;
      } finally {
        document.getElementById("loaderOverlay").style.display = "none";
      }
    });
  }
});
