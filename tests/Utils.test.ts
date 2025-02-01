// tests/Utils.test.ts
import { Utils } from '../src/Utils';

describe('Utils', () => {
    describe('Détection de type', () => {
        test('devrait détecter correctement les fonctions asynchrones', () => {
            expect(Utils.isAsyncFunction(async () => {})).toBe(true);
            expect(Utils.isAsyncFunction(() => {})).toBe(false);
        });

        test('devrait détecter correctement les segments de fonction', () => {
            expect(Utils.isFunctionSegment('method()')).toBe(true);
            expect(Utils.isFunctionSegment('method(1,2)')).toBe(true);
            expect(Utils.isFunctionSegment('property')).toBe(false);
        });

        test('devrait détecter correctement les segments de tableau', () => {
            expect(Utils.isArraySegment('main[0]')).toBe(true);
            expect(Utils.isArraySegment('map[key]')).toBe(true);
            expect(Utils.isArraySegment('property')).toBe(false);
        });

        test('devrait détecter correctement les types de valeur', () => {
            expect(Utils.isObject({})).toBe(true);
            expect(Utils.isObject(null)).toBe(false);
            
            expect(Utils.isFunction(() => {})).toBe(true);
            expect(Utils.isFunction({})).toBe(false);
            
            expect(Utils.isArray([])).toBe(true);
            expect(Utils.isArray({})).toBe(false);
            
            expect(Utils.isMap(new Map())).toBe(true);
            expect(Utils.isMap({})).toBe(false);
            
            expect(Utils.isSet(new Set())).toBe(true);
            expect(Utils.isSet([])).toBe(false);
        });
    });
});