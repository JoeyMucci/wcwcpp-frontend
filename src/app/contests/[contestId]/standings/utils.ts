export interface LeaderboardRow {
    rank: number;
    username: string;
    totalPoints: number;
    groupPoints: number;
    knockoutPoints: number;
}

/**
 * Aggregates overall, group, and knockout scores by username.
 */
export function mapLeaderboardData(overall: any[], group: any[], knockout: any[]): LeaderboardRow[] {
    return overall.map((e: any, index: number) => {
        const groupEntry = group.find((g: any) => g.name === e.name);
        const koEntry = knockout.find((k: any) => k.name === e.name);
        return {
            rank: index + 1,
            username: e.name,
            totalPoints: Number(e.score),
            groupPoints: groupEntry ? Number(groupEntry.score) : 0,
            knockoutPoints: koEntry ? Number(koEntry.score) : 0
        };
    });
}
