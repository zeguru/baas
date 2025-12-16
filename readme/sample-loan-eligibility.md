# Loan Eligibility

## Overview

This sample ruleset shows how we may define and enforce loan application requirements.

It implements heavy validation. Almost all the rules perform validation and stop (`break=true`) when triggered.

Uses an inbuilt utility function age() to compute memberAge from the date of birth.

NB: to be refined to make it more realistic

## Logic
- Validates base facts (supplied by user)
- Validates computed / derived facts eg. Education loan is available to people younger than 30
- 
   

## Concepts
- expressions take in any valid mathematical expression eg `loanAmount * (1 + loanRate)`
- Beware of complex arighmetic. Prefer to split longer expressions otherwise the rules will become hard to explain and reason.
- In built utility functions (in addition to math functions)
  - age()
  - daysBetween()
  - addDays()
  - coalesce()
- In built variables 
  - currentDateTime
  - currentDate
  - currentYear
  - currentMonth
  - currentDay



