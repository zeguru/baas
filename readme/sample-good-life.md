# Good Life

## Overview

The Simplest RuleSet.

This sample ruleset shows what makes a good day in a developers life. 

Uses the amount of **coffee taken, number of code commits, number of pending support incidents in production.**

It also highlights the dangers of **deploying on a Fridays**.


## Logic
All is good when 
- `numberOfCofeeCups` is less or equal 3, 
- `numberOfCommitsToday` is 1 or more
- There are no (0) `numberOfProductionIncidents`
- And no planned Friday releases (`releaseDay`)

## Concepts
- Highest priority rules execute first. Appear on top.
- Rules sharing priority are executed in parallel.
- The rule representing **the good life** is executed last after checking all the above.

