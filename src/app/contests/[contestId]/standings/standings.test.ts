import { describe, it, expect } from 'vitest';
import { mapLeaderboardData } from './utils';

describe('Standings Data Aggregation Utility', () => {
    it('correctly maps overall, group, and knockout streams by username', () => {
        const overall = [
            { name: 'Joey Ronaldo', score: '345' },
            { name: 'Sarah Oracle', score: '330' },
            { name: 'Arthur Goal', score: '312' }
        ];
        
        const group = [
            { name: 'Joey Ronaldo', score: '180' },
            { name: 'Sarah Oracle', score: '170' },
            { name: 'Arthur Goal', score: '152' }
        ];
        
        const knockout = [
            { name: 'Joey Ronaldo', score: '165' },
            { name: 'Sarah Oracle', score: '160' },
            { name: 'Arthur Goal', score: '160' }
        ];

        const result = mapLeaderboardData(overall, group, knockout);

        expect(result).toHaveLength(3);
        
        // Assert first place
        expect(result[0]).toEqual({
            rank: 1,
            username: 'Joey Ronaldo',
            totalPoints: 345,
            groupPoints: 180,
            knockoutPoints: 165
        });

        // Assert rank indexes
        expect(result[0].rank).toBe(1);
        expect(result[1].rank).toBe(2);
        expect(result[2].rank).toBe(3);
    });

    it('gracefully handles missing group or knockout scores defaulting them to 0', () => {
        const overall = [
            { name: 'Joey Ronaldo', score: '100' }
        ];
        const group: any[] = [];
        const knockout = [
            { name: 'Joey Ronaldo', score: '60' }
        ];

        const result = mapLeaderboardData(overall, group, knockout);

        expect(result[0]).toEqual({
            rank: 1,
            username: 'Joey Ronaldo',
            totalPoints: 100,
            groupPoints: 0,
            knockoutPoints: 60
        });
    });
});
