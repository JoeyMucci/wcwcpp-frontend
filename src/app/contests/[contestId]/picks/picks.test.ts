import { describe, it, expect } from 'vitest';
import { checkReachedTarget, calculateKnockoutPoints } from './utils';

describe('checkReachedTarget', () => {
    const mockMatches = [
        // Final match: Round 5, Index 0
        {
            round: 5,
            roundIndex: 0,
            country1: { code: 'FRA' },
            country2: { code: 'ENG' }
        },
        // 3rd place match: Round 5, Index 1
        {
            round: 5,
            roundIndex: 1,
            country1: { code: 'ESP' },
            country2: { code: 'GER' }
        }
    ];

    it('should correctly evaluate teams reaching Round of 16 (roundVal = 2)', () => {
        // Any team in knockoutResults with round >= 2 reached Round of 16
        const results = [{ country: { code: 'ESP' }, round: 2 }];
        expect(checkReachedTarget('ESP', 2, results, mockMatches)).toBe(true);
        expect(checkReachedTarget('FRA', 2, results, mockMatches)).toBe(false);
    });

    it('should correctly evaluate teams reaching Semifinals (roundVal = 4)', () => {
        // Teams with achieved round >= 4 (including 7 for 3rd place winner)
        const results = [
            { country: { code: 'ESP' }, round: 7 }, // Spain won 3rd place
            { country: { code: 'GER' }, round: 5 }, // Germany lost 3rd place (4th place)
            { country: { code: 'FRA' }, round: 6 }, // France Champion
            { country: { code: 'ENG' }, round: 5 }, // England Runner-up
            { country: { code: 'ITA' }, round: 3 }  // Italy QF
        ];

        expect(checkReachedTarget('ESP', 4, results, mockMatches)).toBe(true);
        expect(checkReachedTarget('GER', 4, results, mockMatches)).toBe(true);
        expect(checkReachedTarget('FRA', 4, results, mockMatches)).toBe(true);
        expect(checkReachedTarget('ENG', 4, results, mockMatches)).toBe(true);
        expect(checkReachedTarget('ITA', 4, results, mockMatches)).toBe(false);
    });

    it('should correctly evaluate teams reaching Finals (roundVal = 5)', () => {
        const results = [
            { country: { code: 'ESP' }, round: 7 }, // Spain won 3rd place
            { country: { code: 'GER' }, round: 5 }, // Germany lost 3rd place (4th place)
            { country: { code: 'FRA' }, round: 6 }, // France Champion
            { country: { code: 'ENG' }, round: 5 }  // England Runner-up
        ];

        // France (Champion) reached Finals
        expect(checkReachedTarget('FRA', 5, results, mockMatches)).toBe(true);
        // England (Runner-up, played in Final match) reached Finals
        expect(checkReachedTarget('ENG', 5, results, mockMatches)).toBe(true);
        // Germany (played in 3rd place match, round 5) did NOT reach Finals
        expect(checkReachedTarget('GER', 5, results, mockMatches)).toBe(false);
        // Spain (won 3rd place match, round 7) did NOT reach Finals
        expect(checkReachedTarget('ESP', 5, results, mockMatches)).toBe(false);
    });

    it('should correctly evaluate Champion (roundVal = 6)', () => {
        const results = [
            { country: { code: 'FRA' }, round: 6 },
            { country: { code: 'ENG' }, round: 5 }
        ];
        expect(checkReachedTarget('FRA', 6, results, mockMatches)).toBe(true);
        expect(checkReachedTarget('ENG', 6, results, mockMatches)).toBe(false);
    });

    it('should correctly evaluate 3rd Place Winner (roundVal = 7)', () => {
        const results = [
            { country: { code: 'ESP' }, round: 7 },
            { country: { code: 'GER' }, round: 5 }
        ];
        expect(checkReachedTarget('ESP', 7, results, mockMatches)).toBe(true);
        expect(checkReachedTarget('GER', 7, results, mockMatches)).toBe(false);
    });
});

describe('calculateKnockoutPoints', () => {
    const mockMatches = [
        { round: 5, roundIndex: 0, country1: { code: 'FRA' }, country2: { code: 'ENG' } },
        { round: 5, roundIndex: 1, country1: { code: 'ESP' }, country2: { code: 'GER' } }
    ];

    const results = [
        { country: { code: 'FRA' }, round: 6 }, // Champion
        { country: { code: 'ENG' }, round: 5 }, // Runner-up (Finalist)
        { country: { code: 'ESP' }, round: 7 }, // 3rd Place Winner
        { country: { code: 'GER' }, round: 5 }, // 4th Place (lost 3rd place match)
        { country: { code: 'ITA' }, round: 3 }  // QF
    ];

    it('should calculate points for correct Champion prediction', () => {
        const predictions = {
            '5-0': 'FRA' // Predicted Champion
        };
        // Should get 35 points
        expect(calculateKnockoutPoints(predictions, results, mockMatches)).toBe(35);
    });

    it('should calculate points for correct 3rd Place prediction', () => {
        const predictions = {
            '5-1': 'ESP' // Predicted 3rd Place
        };
        // Should get 5 points
        expect(calculateKnockoutPoints(predictions, results, mockMatches)).toBe(5);
    });

    it('should NOT award Finals or Champion points to a team that only reached/won 3rd place match', () => {
        const predictions = {
            '4-0': 'ESP', // Predicted Spain to reach Finals (roundVal = 5, worth 30 points)
            '5-0': 'ESP', // Predicted Spain to be Champion (roundVal = 6, worth 35 points)
            '5-1': 'ESP'  // Predicted Spain to win 3rd Place (roundVal = 7, worth 5 points)
        };
        // Spain reached round 7 (3rd place winner), they did NOT reach Finals (round 5) or Champion (round 6).
        // They should ONLY get 5 points for the correct 3rd place prediction.
        // (Previously, due to the >= bug, they got 30 + 35 + 5 = 70 points!)
        expect(calculateKnockoutPoints(predictions, results, mockMatches)).toBe(5);
    });

    it('should calculate cumulative points across different rounds', () => {
        const predictions = {
            '1-0': 'ITA', // Predicted Italy in R16 (roundVal = 2, worth 15 points) - Italy reached QF (round 3 >= 2) - Correct: 15 pts
            '2-0': 'ITA', // Predicted Italy in QF (roundVal = 3, worth 20 points) - Italy reached QF (round 3 >= 3) - Correct: 20 pts
            '3-0': 'ITA', // Predicted Italy in SF (roundVal = 4, worth 25 points) - Italy reached QF (round 3 < 4) - Incorrect: 0 pts
            '4-0': 'FRA', // Predicted France in Finals (roundVal = 5, worth 30 points) - France reached Finals - Correct: 30 pts
            '5-0': 'FRA'  // Predicted France Champion (roundVal = 6, worth 35 points) - France is Champion - Correct: 35 pts
        };
        // Total should be: 15 (R16) + 20 (QF) + 30 (Finals) + 35 (Champion) = 100 points
        expect(calculateKnockoutPoints(predictions, results, mockMatches)).toBe(100);
    });
});
