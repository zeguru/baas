# Survey

## Overview 

### Session management

This sample ruleset shows an arbitrary session / state management.

This two/way ruleset demonstrates how you can stop to ask for user input before proceeding with the 'conversation'.

Also demonstrates branching based on previous input. 

Response is highlighed in red whenever it contains `stopped:true` meaning it fired a rule with `break=true`

Useful for session management, conversational SMS and USSD menus.

## Logic
- Initialized the first rule execution with `currentDateTime` to track session start. 
- To ask for user input we stop the rule by setting `break=true` on that rule.
- For failed validation we set `break=true` so that users can correct their input.
- For state awareness rules have a When condition on `session.state.step` 
- The last successful rule is also updated to `currentDateTime` to track session end. 
- Background execution does not set `break=true`

## Concepts
- A session is identified by the presense of a `sessionID` fact. 
- Sessions remain tracked unless when idle for more than 30 minutes.
- User input/feedback is received through only one fact:- `input`. Because this is sequential logic.
- The current step is available at `session.state.step`
- The first step is always `DEFAULT`
- Step is automatically updated to the **Item** of the **Then**
- Session state is maintained at `session.state.*`
