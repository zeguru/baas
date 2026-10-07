# Table Lookup

## Overview
This sample ruleset shows how to define variables (relationships) in a tabular format.

It is a hypothetical ruleset that demonstrates the three kinds of table lookups:- **value-lookup, range-lookup** and **value-range-lookup**.

All lookup tables should set a **default value** incase of a **miss**.

All lookups are case insensitive.

 

## Logic
- Validates the category by referencing the defined list.
- Calculates *riskFactor* using `range-lookup`. Checks the **age** range *(Base Fact)* to identify the value.
- Assings *Citizenship* using `value-lookup`. Checks the **countryCode** value *(Base Fact)* to do this.
- Rule number 4 checks for a valid category in a list, ie, ["VIP","PREMIUM","BASIC"] as part of its preconditions before firing.
- Awards Points based on customer **category**(Table Key) and **quantity**(Base Fact) to identify the number of points to give.


## Concepts
- *value lookup* uses exact values while *range lookup* work with ranges
- `value-range-lookup` is a nested table and requires a *Table Key* to identify the table to use.
- Operators `in`,`inIgnoreCase`,`notIn`,`notInIgnoreCase` expect a list/array. eg `["VIP","PREMIUM","BASIC"]` or `[1,2,3]`
