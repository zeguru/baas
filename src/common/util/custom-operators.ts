import { Engine } from 'json-rules-engine';

export function registerCustomOperators(engine: Engine) {

    /**
     * "equalIgnoreCase" operator for case-insensitive string comparison
     */
    engine.addOperator('equalIgnoreCase', (factValue, jsonValue) => {
        if (typeof factValue !== 'string' || typeof jsonValue !== 'string') {
            return false;
            }
        return factValue.toLowerCase() === jsonValue.toLowerCase();
        });


    /**
     * "isDefined" removes clutter in conditions while also clarifying the intent
     */
    engine.addOperator('isDefined', (factValue, jsonValue) => {

        if (typeof jsonValue !== 'boolean') {
            throw new Error('[isDefined] operator requires a boolean literal (true|false)');
            }

        const isDefined = factValue !== undefined && factValue !== null;
        return jsonValue ? isDefined : !isDefined;
    });

    /**
     * "always" operator for unconditional evaluation.
     * Example usage:
     * { "fact": "always", "operator": "always", "value": true }
     */
    engine.addOperator('always', (_, jsonValue) => {
        if (typeof jsonValue !== 'boolean') {
            throw new Error(`[always] operator requires a boolean value, got: ${typeof jsonValue}`);
            }
        return jsonValue;
    });

    //glue fact to make the `always` operator work with the `always` fact
    engine.addFact('always', async () => true);


    /**
     * "inIgnoreCase" operator for case insensitivie IN lookups .
     */
    engine.addOperator('inIgnoreCase', (factValue: any, jsonValue: any[]) => {
        if (!Array.isArray(jsonValue)) {
            throw new Error("Operator 'inIgnoreCase' expects an array as the rule value");
            }

        // Only do case-insensitive match for strings
        if (typeof factValue === 'string') {
            return jsonValue.some(v =>
                typeof v === 'string' && v.toLowerCase() === factValue.toLowerCase()
                );
            }

        // Fallback for numbers, booleans, etc.
        return jsonValue.includes(factValue);
        });


        
    /**
     * "notInIgnoreCase" operator for case insensitivie negation of IN lookups .
     */
    engine.addOperator('notInIgnoreCase', (factValue: any, jsonValue: any[]) => {
        if (!Array.isArray(jsonValue)) {
            throw new Error("Operator 'notInIgnoreCase' expects an array as the rule value");
            }

        if (typeof factValue === 'string') {
            return !jsonValue.some(
                v => typeof v === 'string' && v.toLowerCase() === factValue.toLowerCase()
                );
            }

        return !jsonValue.includes(factValue);
        });

    }
