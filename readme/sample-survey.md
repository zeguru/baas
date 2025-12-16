# Survey

## Overview
This sample ruleset shows an arbitrary session / state management.

A session is identified by the presense of a `sessionID` fact. 

As long as the `sessionID` is present all previous input will be tracked unless when idle for more than 30 minutes.

All user input/feedback is received through only one fact:- `input`. Because this is sequential logic.

Response is highlighed in red whenever it contains `stopped:true` meaning it fired a rule with `break=true`

Useful for state machines, conversational SMS and USSD menus.

## Logic
- Initialized the first rule execution with `currentDateTime` to track session start. 
- To ask for user input we stop the rule by setting `break=true` on that rule.
- For failed validation we set `break=true` so that users can correct their input.
- For state awareness rules have a When condition on `session.state.step` 
- The last successful rule is also updated to `currentDateTime` to track session end. 
- Background execution does not set `break=true`

## Concepts
- The current step is available at `session.state.step`
- The first step is always `DEFAULT`
- step is automatically aligned by the **Item** of the **Then** setting
- Use `equalIgnoreCase` to avoid case sensitivity traps
- All previous input for each session is maintained at `session.state.*`
