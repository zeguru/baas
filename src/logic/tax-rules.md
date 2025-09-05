1. Income Tax


Unemployed / aka zero gross salary. Stop further processing


```
{
  "conditions": {
    "all": [
      { "fact": "grossSalary", "operator": "equal", "value": 0 }
    ]
  },
  "event": {
    "type": "income-tax",
    "params": { "rate": 0.10, "base": "grossSalary", "operation": "subtract" }
    
  },
  "priority": 100,
  "break": true
}
```


<= 50K

```
{
  "conditions": {
    "all": [
      { "fact": "grossSalary", "operator": "lessThanInclusive", "value": 50000 }
    ]
  },
  "event": {
    "type": "income-tax",
    "params": { "rate": 0.10, "base": "grossSalary", "operation": "subtract" }
    
  },
  "priority": 5
}
```

>50K

```
{
  "conditions": {
    "all": [
      { "fact": "grossSalary", "operator": "greaterThan", "value": 50000 }
    ]
  },
  "event": {
    "type": "income-tax",
    "params": { "rate": 0.20, "base": "grossSalary", "operation": "subtract" } }
  },
  "priority": 5
}

```

2. Health Insurance


```
{
  "conditions": { "all": [] },
  "event": {
    "type": "health-insurance",
    "params": { "rate": 0.05, "base": "grossSalary", "operation": "subtract" } },
  },
  "priority": 4
}
```

3. Pension


```
{
  "conditions": { "all": [] },
  "event": {
    "type": "pension",
    "params": { "rate": 0.08, "base": "grossSalary" , "operation": "subtract" },
  },
  "priority": 4
}
```

4. Social Fund (net salary after income tax)


```
{
  "conditions": { "all": [] },
  "event": {
    "type": "social-fund",
    "params": { "rate": 0.02, "base": "netAfterBaseTaxes" , "operation": "subtract" },
  },
  "priority": 2
}
```

5. Add allowance for VIP

```
{
  "conditions": [
    { "fact": "isVipEmployee", "operator": "equal", "value": true }
  ],
  "event": {
    "type": "vip-bonus",
    "params": { "amount": 500, "base": "finalNet", "operation": "add" } },
  },
  "priority": 1
}
```

6. Insurance Relief

```
{
  "conditions": { "all": [] },
  "event": {
    "type": "insurance-relief",
    "params": {
      "amount": 2500,
      "base": "finalNet",
      "operation": "subtract"
    }
  },
  "priority": 1
}
```