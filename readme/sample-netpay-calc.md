# Net Pay

## Overview
This sample ruleset shows how a typical NET pay calculator can be implemented.

Intermediate/derived facts can be used in subsequent lower priority steps eg `taxableIncome` is used right after being computed

This is a realistic example.

## Logic
- Executes rules in order of priority from the highest to the lowest.
- Each rule has a condition for firing configured at **When** tab. 
- Applies the deductions and levies as rules execute.
- Uses a intermediate/derived fact `taxableIncome` to compute bands/tiers (1 to 4)
- Uses intermediate facts in several expressions too eg when computing NET pay.
   
## Concepts
- Intermediate / derived facts are those that were not supplied by user input
- Base facts are those supplied by user input