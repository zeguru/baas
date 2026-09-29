let sandboxView = "json";


function createForm(data, container) {
    container.innerHTML = "";

    const form = document.createElement("form");
    form.className = "dynamic-form__form";

    const grid = document.createElement("div");
    grid.className = "dynamic-form__grid";

    for (const [key, value] of Object.entries(data)) {

        const field = document.createElement("div");
        field.className = "dynamic-form__field";

        const label = document.createElement("label");
        label.className = "dynamic-form__label";
        label.htmlFor = `field-${key}`;

        label.textContent = prettifyKey(key);


        const input = document.createElement("input");

        input.id = `field-${key}`;
        input.name = key;
        input.required = true;
        input.className = "dynamic-form__input";
        input.value = value ?? "";

        // Infer a sensible input type
        if (typeof value === "number") {
            input.type = "number";
        } else if (
            typeof value === "string" &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
            input.type = "email";
        } else {
            input.type = "text";
        }

        field.appendChild(label);
        field.appendChild(input);

        grid.appendChild(field);
    }

    const actions = document.createElement("div");
    actions.className = "dynamic-form__actions";


    form.appendChild(grid);
    form.appendChild(actions);

    container.appendChild(form);

    return form;
}


function prettifyKey(key) {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

function getSandboxView(){
    return sandboxView;
    }

function setSandboxView(view) {
    if (view === sandboxView) {
        return;
    }

    if (view === "visual") {
        // JSON → Visual
        // Build the form from the current JSON.
        syncJsonToForm();
    } else {
        // Visual → JSON
        // Save any edits made in the form back to JSON.
        syncFormToJson();
    }

    sandboxView = view;

    const jsonButton = document.getElementById("sandboxJsonViewBtn");
    const visualButton = document.getElementById("sandboxVisualViewBtn");

    const requestJson = document.getElementById("requestJsonView");
    const requestVisual = document.getElementById("requestVisualView");

    const responseJson = document.getElementById("responseJsonView");
    const responseVisual = document.getElementById("responseVisualView");

    const isJson = view === "json";

    // Toggle buttons
    jsonButton.classList.toggle("active", isJson);
    visualButton.classList.toggle("active", !isJson);

    // Request
    requestJson.classList.toggle("d-none", !isJson);
    requestVisual.classList.toggle("d-none", isJson);

    // Response
    responseJson.classList.toggle("d-none", !isJson);
    responseVisual.classList.toggle("d-none", isJson);
}


//Visual Output / Receipt like
function renderResponseReceipt(data) {
    const container = document.getElementById("responseReceipt");

    if (!container) {
        return;
    }

    const baseFacts = data.baseFacts || {};
    const derivedFacts = data.derivedFacts || {};
    const breakdown = Array.isArray(data.breakdown)
        ? data.breakdown
        : [];

    const formatLabel = key => {
        return key
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const formatValue = value => {
        if (value === null || value === undefined) {
            return "-";
        }

        return String(value);
    };

    const rows = (object) => {
        return Object.entries(object)
            .map(([key, value]) => `
                <div class="response-receipt__row">
                    <span class="response-receipt__label">
                        ${formatLabel(key)}
                    </span>
                    <span class="response-receipt__value">
                        ${formatValue(value)}
                    </span>
                </div>
            `)
            .join("");
    };

    const breakdownHtml = breakdown
        .map(item => {
            const isValidationFailure =
                item.do === "validation" &&
                (item.result === undefined ||
                item.result === null ||
                item.result === "");

            return `
                <div class="response-receipt__item">
                    <div class="response-receipt__item-main">
                        <span class="response-receipt__check ${isValidationFailure ? "response-receipt__check--error" : ""}">
                            ${isValidationFailure ? "×" : "✓"}
                        </span>

                        <span class="response-receipt__message">
                            ${item.message || item.do || ""}
                        </span>
                    </div>

                    <div class="response-receipt__item-result">
                        ${formatValue(item.result)}
                    </div>
                </div>
            `;
        })
        .join("");

    const derivedKeys = Object.keys(derivedFacts);

    console.log("data ")
    console.log(data)

    let resultKey = ""
    let resultValue = null;



    if(!data.stopped){
        resultKey = derivedKeys[derivedKeys.length - 2];

        resultValue = resultKey
            ? derivedFacts[resultKey]
            : null;
        }

    if(data.code == 'ENGINE_ERROR'){
        alert(data.message);
        return;
        }

    container.innerHTML = `
        <div class="response-receipt ${data.stopped ? "response-receipt--exception" : ""}">

            <div class="response-receipt__header">
                <div class="response-receipt__title">
                    Calculator Result
                </div>

                <div class="response-receipt__ruleset">
                    ${data.ruleSet || "-"}
                </div>

                <div class="response-receipt__status">
                    ${data.stopped ? "Stopped" : "Completed"}
                </div>
            </div>


            ${Object.keys(baseFacts).length ? `
                <div class="response-receipt__section">
                    <div class="response-receipt__section-title">
                        Input
                    </div>

                    ${rows(baseFacts)}
                </div>
            ` : ""}


            ${Object.keys(derivedFacts).length ? `
                <div class="response-receipt__section">

                    <div class="response-receipt__section-title">
                        Calculation
                    </div>

                    ${rows(
                        Object.fromEntries(
                            Object.entries(derivedFacts)
                                .filter(([key]) => key !== resultKey)
                        )
                    )}

                    ${resultValue !== null ? `
                        <div class="response-receipt__total">
                            <span class="response-receipt__total-label">
                                ${formatLabel(resultKey)}
                            </span>

                            <span class="response-receipt__total-value">
                                ${formatValue(resultValue)}
                            </span>
                        </div>
                    ` : ""}

                </div>
            ` : ""}


            ${breakdown.length ? `
                <div class="response-receipt__section">

                    <div class="response-receipt__section-title">
                        Breakdown
                    </div>

                    <div class="response-receipt__breakdown">
                        ${breakdownHtml}
                    </div>

                </div>
            ` : ""}


            ${derivedFacts.timestamp ? `
                <div class="response-receipt__footer">
                    ${derivedFacts.timestamp}
                </div>
            ` : ""}

        </div>
    `;
}


// JSON → Visual
function syncJsonToForm() {
    const textarea = document.getElementById("tryInput");
    const container = document.getElementById("formInput");

    if (!textarea || !container) {
        return;
    }

    try {
        const data = JSON.parse(textarea.value);

        createForm(data, container);

    } catch (error) {
        console.warn("Cannot render form: invalid JSON", error);

        container.innerHTML = `
            <div class="alert alert-warning small mb-0">
                Select a ruleset before switching to Visual mode.
            </div>
        `;
    }
}


// Visual → JSON
function syncFormToJson() {
    const form = document.querySelector("#formInput form");
    const textarea = document.getElementById("tryInput");

    if (!form || !textarea) {
        return;
    }

    const data = Object.fromEntries(new FormData(form));

    textarea.value = JSON.stringify(data, null, 2);
}


// Toggle buttons
document
    .getElementById("sandboxJsonViewBtn")
    .addEventListener("click", () => {
        setSandboxView("json");
    });

document
    .getElementById("sandboxVisualViewBtn")
    .addEventListener("click", () => {
        setSandboxView("visual");
    });


