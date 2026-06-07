export const checkReachedTarget = (
    code: string,
    targetRound: number,
    knockoutResults: any[],
    knockoutMatches: any[]
): boolean => {
    return knockoutResults.some(r => {
        if (r.country?.code !== code) return false;
        const achieved = Number(r.round);
        if (targetRound === 7) return achieved === 7;
        if (targetRound === 6) return achieved === 6;
        if (targetRound === 5) {
            if (achieved === 6) return true;
            const finalMatch = knockoutMatches.find(m => Number(m.round) === 5 && Number(m.roundIndex) === 0);
            return !!(finalMatch && (finalMatch.country1?.code === code || finalMatch.country2?.code === code));
        }
        // For targetRound <= 4 (Semifinals, QF, R16)
        return achieved >= targetRound || (achieved === 7 && targetRound <= 4);
    });
};

export const calculateKnockoutPoints = (
    knockoutPredictions: Record<string, string>,
    knockoutResults: any[],
    knockoutMatches: any[]
): number => {
    let total = 0;
    const checkPoints = (rKey: string, roundVal: number, points: number) => {
        const code = knockoutPredictions[rKey];
        if (!code) return;
        const reachedTarget = checkReachedTarget(code, roundVal, knockoutResults, knockoutMatches);
        if (reachedTarget) {
            total += points;
        }
    };

    for (let i = 0; i < 16; i++) checkPoints(`1-${i}`, 2, 15);
    for (let i = 0; i < 8; i++) checkPoints(`2-${i}`, 3, 20);
    for (let i = 0; i < 4; i++) checkPoints(`3-${i}`, 4, 25);
    for (let i = 0; i < 2; i++) checkPoints(`4-${i}`, 5, 30);
    checkPoints(`5-0`, 6, 35);
    checkPoints(`5-1`, 7, 5);

    return total;
};
