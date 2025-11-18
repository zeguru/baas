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

    engine.addOperator('notEqualIgnoreCase', (factValue, jsonValue) => {
        if (typeof factValue !== 'string' || typeof jsonValue !== 'string') {
            return true; 
            }
        return factValue.toLowerCase() !== jsonValue.toLowerCase();
        });


    /**
     * "isDefined" removes clutter in conditions while also clarifying the intent
     */
    engine.addOperator('isDefined', (factValue, jsonValue) => {

        let booleanValue = false;
        if (typeof jsonValue === 'boolean') 
            booleanValue = jsonValue
        else if (typeof jsonValue === 'string') 
            booleanValue = jsonValue === 'true';

        const isDefined = factValue !== undefined && factValue !== null;
        return booleanValue ? isDefined : !isDefined;
        });



        
    /**
     * "always" operator for unconditional evaluation.
     * Example usage: { "fact": "always", "operator": "always", "value": true }
     */
    engine.addOperator('always', (_, jsonValue) => {
        if (typeof jsonValue === 'boolean') return jsonValue;
        if (jsonValue === 'true' || jsonValue === 'false') return jsonValue === 'true';
        throw new Error(`[always] operator requires a boolean or 'true'/'false' string, got: ${jsonValue}`);
        });

    //glue fact to make the `always` operator work with the `always` fact
    engine.addFact('always', async () => true);

    /**
     * "inIgnoreCase" operator for case insensitivie IN lookups .
     */
    engine.addOperator('inIgnoreCase', (factValue: any, jsonValue: any[]) => {

        let jsonArray;
        if (Array.isArray(jsonValue)) {
            jsonArray = jsonValue
            }
        else{
            jsonArray = JSON.parse(jsonValue);
            }

        // Only do case-insensitive match for strings
        if (typeof factValue === 'string') {
            return jsonArray.some(v =>
                typeof v === 'string' && v.toLowerCase() === factValue.toLowerCase()
                );
            }

        // Fallback for numbers, booleans, etc.
        return jsonArray.includes(factValue);
        });
 
    /**
     * "notInIgnoreCase" operator for case insensitivie negation of IN lookups .
     */
    engine.addOperator('notInIgnoreCase', (factValue: any, jsonValue: any[]) => {

        let jsonArray;
        if (Array.isArray(jsonValue)) {
            jsonArray = jsonValue
            }
        else{
            jsonArray = JSON.parse(jsonValue);
            }

        if (typeof factValue === 'string') {
            return !jsonArray.some(
                v => typeof v === 'string' && v.toLowerCase() === factValue.toLowerCase()
                );
            }

        return !jsonArray.includes(factValue);
        });

    }

    