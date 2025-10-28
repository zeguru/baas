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
     * "isDefined" removes clutter in conditions but also clarifying the intent
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

    }
