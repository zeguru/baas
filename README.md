<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="public/images/baas-auto-generated.png" alt="Nest Logo" /></a>
</p>


BaaS - Business logic As A Service
  
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/maburazeguru" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


# 🚀 BaaS

**Explainable, deterministic rule engine with API and built-in UI**

Power business rules, workflows, and AI guardrails with a fully open-source, developer-friendly engine designed for clarity, control, and auditability.


# Background
Many awesome rule engienes lack a decent webui.
May lack a decision trace. Why a specific decision was made
Many cant be easily used for validating input / output of AI agents 


## ✨ Features

* ⚡ Deterministic rule evaluation
* 🧠 Explainable **decision traces** (see exactly *why* a rule passed or failed)
* 🔌 API-first design
* 🖥️ Built-in UI for rule creation and testing
* 🧪 Interactive “try-it” sandbox
* 🐳 Docker-ready for instant setup
* 📦 Sample rules included
* 🤖 Works great as guardrails for AI systems
* Your choice. Create rules using json or a form.

---

## 📸 Overview

**Core flow:**

1. Create a ruleset (identifier for a group of rules)
2. Define rules 
- via api
    (via UI or API)
2. Send input data
3. Get:

   * ✅ Result
   * 🧠 Decision trace (step-by-step breakdown)

---

## 🚀 Quick Start 

### 1. Run with Docker

```bash
docker run -p 3000:3000 zeguru/baas:latest
```

### 2. Access the app

* API: http://localhost:3000/baas
* Editor UI: http://localhost:3000/baas/editor
* OpenApi Docs: http://localhost:3000/baas/docs

---

## Option: Docker Compose

```yaml
version: '3.8'

services:
  app:
    image: zeguru/baas:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

---

### Option: Contributors

```bash
git clone https://github.com/zeguru/baas.git
cd baas
```

### Run with Docker

```bash
docker-compose up --build
```

---

#### A. Rule Condition

Define preconditions for rule execution.

Supported Operators:

- `always`
- `isDefined`
- `lessThan`
- `lessThanInclusive`
- `greaterThan`
- `greaterThanInclusive`
- `equal`
- `equalIgnoreCase`
- `notEqual`
- `notEqualIgnoreCase`
- `in`
- `inIgnoreCase`
- `notIn`
- `notInIgnoreCase`

![when](public/images/baas-when.png)

### B. Rule Definition: 

Rule Action: main options: 

- `advice`
- `validation`
- `apply-adjustment`

#### i. validation

Message with an option to `break`, ie stop the execution and return immediately.

![then](public/images/baas-then.png)


#### ii. apply-adjustment

Modes available: 

- `fixed`
- `rate`
- `expression`
- Lookups: `value-lookup`, `range-lookup`, `value-range-lookup`

Expression

![expression](public/images/baas-expression.png)

Value Lookup

![value-lookup](public/images/baas-value-lookup.png)

Range Lookup

![range-lookup](public/images/baas-range-lookup.png)

Value Range Lookup

![value-range-lookup](public/images/baas-value-range-lookup.png)

Try It

![try-it](public/images/baas-try-it.png)
---

## 🧪 Example Usage

### Evaluate Business Logic: Calculate Net Pay 

Request

POST `baas/calculator/sample-netpay-calc/compute`

```json
    {
    "grossPay": "150000"
    }
```

Response

`baseFacts` are the original facts passed.

`derivedFacts` includes all computed values.

`breakdown` is the object that explains each fired rule and the result at that instance.
This can be displayed on a user interface or added to the LLM context when used in an AI agent.

`stopped=false` means that the evaluation was not interrupted/stopped by any rule.

```json
{
  "ruleSet": "sample-netpay-calc",
  "stopped": false,
  "baseFacts": {
    "grossPay": "150000"
  },
  "derivedFacts": {
    "shif": 4125,
    "housingLevy": 2250,
    "nssfTier1": 8000,
    "nssfTier2": 64000,
    "nssfTotal": 4320,
    "personalRelief": 2400,
    "taxableIncome": 143625,
    "band1": 24000,
    "band2": 8333,
    "band3": 111292,
    "grossPAYE": 37870.85,
    "finalPAYE": 35470.85,
    "netPay": 103834.15,
    "timestamp": "2026-04-08T11:17:45+03:00"
  },
  "breakdown": [
    {
      "do": "apply-adjustment",
      "message": "SHIF. 2.75% of gross pay",
      "result": 4125
    },
    {
      "do": "apply-adjustment",
      "message": "Housing Levy. 1.5% of gross pay",
      "result": 2250
    },
    {
      "do": "apply-adjustment",
      "message": "NSSF Tier I. First 8000 or less if pay is less than 8,000",
      "result": 8000
    },
    {
      "do": "apply-adjustment",
      "message": "NSSF Tier II. Next 64,000 or less if gross pay is less than 72,000",
      "result": 64000
    },
    {
      "do": "apply-adjustment",
      "message": "Compute Total NSSF deduction",
      "result": 4320
    },
    {
      "do": "apply-adjustment",
      "message": "Define Personal Relief",
      "result": 2400
    },
    {
      "do": "apply-adjustment",
      "message": "Compute taxable income",
      "result": 143625
    },
    {
      "do": "apply-adjustment",
      "message": "Identify amount falling within band 1. (5K-24K)",
      "result": 24000
    },
    {
      "do": "apply-adjustment",
      "message": "Identify amount falling within band 2. (next 8,333)",
      "result": 8333
    },
    {
      "do": "apply-adjustment",
      "message": "Identify amount falling within band 3. (next 467,667)",
      "result": 111292
    },
    {
      "do": "apply-adjustment",
      "message": "Compute PAYE before Relief",
      "result": 37870.85
    },
    {
      "do": "apply-adjustment",
      "message": "Compute PAYE after Relief",
      "result": 35470.85
    },
    {
      "do": "apply-adjustment",
      "message": "Compute NET pay",
      "result": 103834.15
    }
  ]
}
```


### Sample Rule

NB: A single rule is not very useful by itself. Multiple rules need to be grouped into what we call a `ruleset` in order to implement some business logic (eg price calculator, quote generator, etc).

A single rule
```json
{
        "when": {
            "all": [
                {
                    "operator": "greaterThan",
                    "value": 3,
                    "fact": "numberOfCofeeCups"
                }
            ]
        },
        "then": {
            "do": "advice",
            "with": {
                "message": "Too much coffee detected! Switch to water before you start coding in circles."
            }
        },
        "priority": 10
    }
```

A named group of rules, aka `ruleset`

```json
[
    {
        "when": {
            "all": [
                {
                    "operator": "greaterThan",
                    "value": 3,
                    "fact": "numberOfCofeeCups"
                }
            ]
        },
        "then": {
            "do": "advice",
            "with": {
                "message": "Too much coffee detected! Switch to water before you start coding in circles."
            }
        },
        "priority": 10
    },
    {
        "when": {
            "all": [
                {
                    "operator": "lessThan",
                    "value": 1,
                    "fact": "numberOfCommitsToday"
                }
            ]
        },
        "then": {
            "do": "advice",
            "with": {
                "message": "No commits yet? Time to make some magic happen."
            }
        },
        "priority": 10
    },
    {
        "when": {
            "all": [
                {
                    "operator": "greaterThanInclusive",
                    "value": 1,
                    "fact": "numberOfProductionIncidents"
                }
            ]
        },
        "then": {
            "do": "advice",
            "with": {
                "message": "Tackling production incidents ? May the force be with you."
            }
        },
        "priority": 10
    },
    {
        "when": {
            "all": [
                {
                    "operator": "equalIgnoreCase",
                    "value": "Friday",
                    "fact": "releaseDay"
                }
            ]
        },
        "then": {
            "do": "advice",
            "with": {
                "message": "Deploying on Friday? May the rollback odds be ever in your favor."
            }
        },
        "priority": 10
    },
    {
        "when": {
            "all": [
                {
                    "operator": "lessThanInclusive",
                    "value": 3,
                    "fact": "numberOfCofeeCups"
                },
                {
                    "operator": "greaterThanInclusive",
                    "value": 1,
                    "fact": "numberOfCommitsToday"
                },
                {
                    "operator": "lessThan",
                    "value": 1,
                    "fact": "numberOfProductionIncidents"
                },
                {
                    "operator": "notEqualIgnoreCase",
                    "value": "Friday",
                    "fact": "releaseDay"
                }
            ]
        },
        "then": {
            "do": "advice",
            "with": {
                "message": "Balanced caffeine, steady commits, no incidents and no Friday releases. You are living the dream."
            }
        },
        "priority": 5
    }
]
```

---

### Evaluating RuleSets

All the `facts` defined in the `ruleset` must be set and sent as a request. Found under the `when` object.

---


## 🧠 Decision Trace (Explainability)

Every evaluation includes a **breakdown**:

* Shows which rules were evaluated
* Shows the order of evaluation
* Shows the result at each step/rule
* Helps in explanations, auditing and debugging purposes

---

## 🧩 Use Cases

* 🛒 Pricing & discounts
* ⚙️ Workflow decisions
* 💳 Payment & fraud rules
* 🔐 Product logic
* 🤖 AI input/output guardrails
* Quote Generator
* Backend as a service
* Add determinism in your AI agents for non-probabilistic business logic
* Conversational SMS / USSD
* State machines




---

## 🛠️ Development

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run start:dev
```

---

## 📁 Project Structure

```
/public         # Editor
/samples        # Sample Rulesets
/readme         # Documentation for sample rulesets
/src/calculator     # Main rule evaluator/calculator
/src/common         # Utils and DTOs
/src/meta           # Dynamic metadata for ui
/src/ruleset        # Ruleset management
/src/session        # Session logic

```

---

## 🤝 Contributing

Contributions are welcome and encouraged!

We need help in

- documentation
- tests
- web ui
- bugfixes

BaaS aims for simplicity. 
- No Hyperlinks
- Clean page
- Few Operations, that work so well

### How to contribute

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to your fork

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request 🎉

---

### Contribution Guidelines

* Keep PRs focused and small
* Write clear commit messages
* Add tests where applicable
* Update documentation if needed

---

## 🧪 Running Tests

```bash
npm run test
```

---

## 📌 Roadmap

* [ ] Rule versioning
* [ ] Execution Stats
* [ ] Support more databases
* [ ] Api key and JWT
* [ ] Rule templates
* [ ] SDK
* [ ] Headless mode (run without editor/docs)

---

## 💬 Feedback & Discussions

* Open an issue for bugs or feature requests
* Use discussions for questions and ideas

---

## 🙌 Credits

Built with:

* NestJS
* TypeScript
* Node.js
* Json Editor - https://github.com/json-editor/json-editor?tab=readme-ov-file
* Form example - https://json-editor.github.io/json-editor/

Inspired by the need for:

* Explainable product logic
* Transparent decision-making
* Developer-friendly rule systems
* Reliable AI guardrails for business rules

---

## 📄 License

GNU Affero General Public License v3 (AGPL)

---

## ⭐ Support

If you find this project useful:

* Star the repo ⭐
* Share it with others
* Contribute!

---

## 🔥 Final Note

This project aims to be the **decision layer for modern applications**—from traditional systems to AI-powered workflows.

Resist all temptations to make this tool complex !

---
