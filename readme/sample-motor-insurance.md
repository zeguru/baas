# Motor Insurance

## Overview
A realistic example.

This sample ruleset shows a typical **premium calculator** for a comprehensive insurance cover.

Notice how only the **bare minimal facts** are necessary to compute the premium. 

NB: A calculator does not need to collect/process PII (Personally Identifiable Information) and unnecessary metadata, vehicle and policy details. Such details should remain in the core system.

Sometimes it is necessary to set NOP rules to have them as placeholders or to make the intent clear. For instance, Excess Protector and Post Election Violence & Terrorism have been defined and deliberately set to zero (0) so that they appear in the breakdown as such.


## Logic
- Sets hard defaults. User is not asked and cannot override them.
- Validates vehicle models and vehicle age.
- Computes premium.

## Concepts
- Settings / Hard Defaults can be set by defining a **fixed** adjustment in a high priority rule.
- Settings / Hard Defaults are not overridable by user. It is recommended to prefix them as such.

