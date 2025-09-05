1. 🎯 Example: Smart Discount & Loyalty Rules


```
{
  "conditions": {
    "all": [
      { "fact": "orderValue", "operator": "greaterThanInclusive", "value": 50 },
      {
        "any": [
          { "fact": "customerType", "operator": "equal", "value": "premium" },
          { "fact": "loyaltyPoints", "operator": "greaterThanInclusive", "value": 200 }
        ]
      }
    ]
  },
  "event": {
    "type": "discount",
    "params": {
      "percentage": 10,
      "message": "You get 10% discount for being loyal or premium with orders above $50"
    }
  },
  "priority": 1
}
```

2. Another Rule (Extra Event for Free Shipping)


```
{
  "conditions": {
    "all": [
      { "fact": "orderValue", "operator": "greaterThanInclusive", "value": 200 }
    ]
  },
  "event": {
    "type": "free-shipping",
    "params": {
      "message": "Orders above $200 qualify for free shipping"
    }
  },
  "priority": 2
}
```

3. Yet Another Rule (VIP Bonus Points)


```
{
  "conditions": {
    "all": [
      { "fact": "customerType", "operator": "equal", "value": "vip" },
      { "fact": "orderValue", "operator": "greaterThanInclusive", "value": 100 }
    ]
  },
  "event": {
    "type": "bonus-points",
    "params": {
      "points": 50,
      "message": "VIP customers get 50 bonus loyalty points"
    }
  },
  "priority": 3
}
```

**Sample Fact**

```
{
  "orderValue": 250,
  "customerType": "vip",
  "loyaltyPoints": 300
}
```
