# Utility Bill

## Overview
This sample ruleset demonstrates tiered computations typical in utility bills.

This is an advanced use case.

This example makes use of the `min()` and `max()` functions distinguish between the tiers.

## Logic
- Uses `min(units,100)` to identify units in Tier 1 (between 1 and 100)
- To Identify units in Tier 2 (101-200), for instance, two things are required
    - Condition: units `greaterThanInclusive` 101 aka `>=101`
    - Get the units (excluding the 100 collected in Tier 1) but not more 100. i.e `min(units-100,100)`
   
## Concepts
- Uses `always` for unconditional execution
- Uses `greaterThanInclusive` to represent `>=`
- Uses `fixed` mode for fixed charges