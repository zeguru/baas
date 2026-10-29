# Quota Tracker

## Overview

The Simplest Tracker.

A demo ruleset showing how to do Quota management at a high velocity. 

This is useful for situations where there is little time to persist to DB and query again. 

Use it to implement **RATE limiters, Request Throttling**

## Logic
Track status via `percentUtilization` and `usageStatus`.

## Concepts
- A session is identified by the presense of a `sessionID` fact. 
- Sessions remain tracked unless when idle for more than 30 minutes.
- User input/feedback is received through only one fact:- `input`. Because this is sequential logic.
- The current step is available at `session.state.step`
- The first step is always `DEFAULT`
- Step is automatically updated to the **Item** of the **Then**
- Session state is maintained at `session.state.*`


