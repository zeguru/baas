# Statistics

## Overview 

### Session management

This sample ruleset shows an arbitrary session / state management.

User supplies numeric values, one by one, using the `input` fact.

The ruleset keeps track of common statistics relating to those numbers... count, sum, mean, min, and max

## Logic
- First rule ensures the user provides `sessionID` and `input` inorder to track changing state.
- Rules 1 to 5 need to execute only once. This is achieved by checking for `session.state.step` equal `DEFAULT` 
- Rule 6 and 7 use simple arithmetic with `session.state.*` to compute new values.
- Rule 8 and 9 use inbuilt mathematical functions `min()` and `max()` to compute new values.
- NB: notice how rule 8 and 9 avoid using the names of the inbuilt functions to set the **Item** name
- There is no rule to stop execution in this example. ie none with `break=true`

## Concepts
- A session is identified by the presense of a `sessionID` fact. 
- Sessions remain tracked unless when idle for more than 30 minutes.
- User input/feedback is received through only one fact:- `input`. Because this is sequential logic.
- The current step is available at `session.state.step`
- The first step is always `DEFAULT`
- Step is automatically updated to the **Item** of the **Then**
- Session state is maintained at `session.state.*`

