class MahjongCalculator {
    constructor() {
        this.yakuList = {
            // 1 han yaku
            riichi: { han: 1, closed: true, name: "Riichi" },
            tanyao: { han: 1, closed: false, name: "All Simples" },
            menzenTsumo: { han: 1, closed: true, name: "Fully Concealed Hand" },
            seatWind: { han: 1, closed: false, name: "Seat Wind" },
            prevalentWind: { han: 1, closed: false, name: "Prevalent Wind" },
            dragons: { han: 1, closed: false, name: "Dragons" },
            pinfu: { han: 1, closed: true, name: "Pinfu" },
            iipeiko: { han: 1, closed: true, name: "Pure Double Sequence" },
            chankan: { han: 1, closed: false, name: "Robbing a Kan" },
            rinshan: { han: 1, closed: false, name: "After a Kan" },
            haitei: { han: 1, closed: false, name: "Under the Sea" },
            houtei: { han: 1, closed: false, name: "Under the River" },
            ippatsu: { han: 1, closed: true, name: "Ippatsu" },

            // 2 han yaku
            doubleRiichi: { han: 2, closed: true, name: "Double Riichi" },
            sanshokuDouko: { han: 2, closed: false, name: "Triple Triplets" },
            sankantsu: { han: 2, closed: false, name: "Three Quads" },
            toitoi: { han: 2, closed: false, name: "All Triplets" },
            sanankou: { han: 2, closed: false, name: "Three Concealed Triplets" },
            shousangen: { han: 2, closed: false, name: "Little Three Dragons" },
            honroutou: { han: 2, closed: false, name: "All Terminals and Honors" },
            chiitoi: { han: 2, closed: true, name: "Seven Pairs" },
            chanta: { han: 2, closed: false, name: "Half Outside Hand" },
            ittsuu: { han: 2, closed: false, name: "Pure Straight" },
            sanshokuDoujun: { han: 2, closed: false, name: "Mixed Triple Sequence" },

            // 3 han yaku
            ryanpeikou: { han: 3, closed: true, name: "Twice Pure Double Sequence" },
            junchan: { han: 3, closed: false, name: "Fully Outside Hand" },
            honitsu: { han: 3, closed: false, name: "Half Flush" },

            // 6 han yaku
            chinitsu: { han: 6, closed: false, name: "Full Flush" },

            // Yakuman (13 han)
            kokushi: { han: 13, closed: true, name: "Thirteen Orphans" },
            chuuren: { han: 13, closed: true, name: "Nine Gates" },
            suuankou: { han: 13, closed: true, name: "Four Concealed Triplets" },
            daisangen: { han: 13, closed: false, name: "Big Three Dragons" },
            tsuuiisou: { han: 13, closed: false, name: "All Honors" },
            chinroutou: { han: 13, closed: false, name: "All Terminals" },
            ryuuiisou: { han: 13, closed: false, name: "All Green" },
            shousuushii: { han: 13, closed: false, name: "Four Little Winds" },
            daisuushii: { han: 13, closed: false, name: "Four Big Winds" }
        };

        this.limitHands = {
            mangan: 8000,
            haneman: 12000,
            baiman: 16000,
            sanbaiman: 24000,
            yakuman: 32000
        };
    }

    calculateFu(hand, conditions) {
        let fu = 20; // Base fu

        if (conditions.tsumo && !this.isPinfu(hand, conditions)) fu += 2;
        if (conditions.isClosed) fu += 10;

        hand.melds.forEach(meld => {
            if (meld.type === 'triplet' && meld.closed) fu += 4;
            if (meld.type === 'triplet' && !meld.closed) fu += 2;
            if (meld.type === 'quad' && meld.closed) fu += 16;
            if (meld.type === 'quad' && !meld.closed) fu += 8;

            if (meld.isTerminalOrHonor) {
                fu *= 2;
            }
        });

        return Math.ceil(fu / 10) * 10;
    }

    findAllCombinations(hand) {
        const result = [];
        const tiles = [...hand];

        const findSets = (remaining, sets = [], pairs = [], complete = false) => {
            if (remaining.length === 0) {
                if (sets.length === 4 && pairs.length === 1) {
                    result.push({ sets, pairs, complete });
                }
                return;
            }

            const t1 = remaining[0];
            const rest = remaining.slice(1);

            // Try pair
            if (pairs.length === 0) {
                const pairMatch = rest.findIndex(t => this.sameTile(t1, t));
                if (pairMatch !== -1) {
                    const newRest = [...rest.slice(0, pairMatch), ...rest.slice(pairMatch + 1)];
                    findSets(newRest, sets, [[t1, rest[pairMatch]]], true);
                }
            }

            // Try triplet
            const tripMatches = rest.reduce((acc, t, i) =>
                this.sameTile(t1, t) ? [...acc, i] : acc, []);
            if (tripMatches.length >= 2) {
                const newRest = rest.filter((_, i) => !tripMatches.slice(0, 2).includes(i));
                findSets(newRest, [...sets, {
                    type: 'triplet',
                    tiles: [t1, rest[tripMatches[0]], rest[tripMatches[1]]]
                }], pairs, true);
            }

            // Try sequence
            if (t1.type !== 'honor' && t1.number <= 7) {
                const t2Idx = rest.findIndex(t =>
                    t.suit === t1.suit && t.number === t1.number + 1
                );
                if (t2Idx !== -1) {
                    const afterT2 = rest.slice(t2Idx + 1);
                    const t3Idx = afterT2.findIndex(t =>
                        t.suit === t1.suit && t.number === t1.number + 2
                    );
                    if (t3Idx !== -1) {
                        const newRest = [...rest.slice(0, t2Idx),
                        ...rest.slice(t2Idx + 1, t2Idx + 1 + t3Idx),
                        ...rest.slice(t2Idx + 1 + t3Idx + 1)];
                        findSets(newRest, [...sets, {
                            type: 'sequence',
                            tiles: [t1, rest[t2Idx], afterT2[t3Idx]]
                        }], pairs, true);
                    }
                }
            }

            if (!complete) {
                findSets(rest, sets, pairs, false);
            }
        };

        findSets(tiles);
        return result;
    }

    detectYaku(hand, conditions) {
        const yakuList = [];
        const sortedHand = this.sortHand(hand);
        const patterns = this.findAllCombinations(sortedHand);

        // Yakuman checks first
        if (this.isKokushi(sortedHand)) return [{ name: 'Thirteen Orphans', han: 13 }];
        if (this.isSuuankou(patterns)) return [{ name: 'Four Concealed Triplets', han: 13 }];
        if (this.isDaisangen(patterns)) return [{ name: 'Big Three Dragons', han: 13 }];

        // Standard yaku
        const yakuChecks = [
            { condition: conditions.riichi && conditions.isClosed, yaku: 'riichi' },
            { condition: conditions.doubleRiichi && conditions.isClosed, yaku: 'doubleRiichi' },
            { condition: conditions.ippatsu && conditions.isClosed, yaku: 'ippatsu' },
            { condition: conditions.tsumo && conditions.isClosed, yaku: 'menzenTsumo' },
            { condition: conditions.chankan, yaku: 'chankan' },
            { condition: conditions.rinshan, yaku: 'rinshan' },
            { condition: conditions.haitei, yaku: 'haitei' },
            { condition: conditions.houtei, yaku: 'houtei' },
            { condition: conditions.threePlayer && conditions.hasKita, yaku: 'kita' },
            { condition: this.isTanyao(sortedHand), yaku: 'tanyao' },
            { condition: this.isPinfu(patterns, conditions), yaku: 'pinfu' },
            { condition: this.isIipeiko(patterns) && !this.isRyanpeikou(patterns), yaku: 'iipeiko' },
            { condition: this.isRyanpeikou(patterns), yaku: 'ryanpeikou' },
            { condition: this.isToitoi(patterns), yaku: 'toitoi' },
            { condition: this.isSanankou(patterns), yaku: 'sanankou' },
            { condition: this.isSankantsu(patterns), yaku: 'sankantsu' },
            { condition: this.isHonitsu(sortedHand) && !this.isChinitsu(sortedHand), yaku: 'honitsu' },
            { condition: this.isChinitsu(sortedHand), yaku: 'chinitsu' }
        ];

        yakuChecks.forEach(({ condition, yaku }) => {
            if (condition) yakuList.push(this.yakuList[yaku]);
        });

        return yakuList;
    }

    isPinfu(patterns, conditions) {
        if (!conditions.isClosed) return false;

        return patterns.some(combo => {
            if (!combo.sets.every(set => set.type === 'sequence')) return false;
            if (combo.sets.length !== 4 || combo.pairs.length !== 1) return false;

            const pair = combo.pairs[0][0];
            if (pair.type === 'honor') return false;
            if (conditions.seatWind && pair.value === conditions.seatWind) return false;
            if (conditions.prevalentWind && pair.value === conditions.prevalentWind) return false;
            if (['white', 'green', 'red'].includes(pair.value)) return false;

            const lastSet = combo.sets[combo.sets.length - 1].tiles;
            const isEdgeWait = lastSet[0].number === 1 || lastSet[2].number === 9;
            const isClosed = lastSet[1].number === conditions.winningTile.number;

            return !isEdgeWait && !isClosed;
        });
    }

    // Helper methods
    sortHand(hand) {
        return [...hand].sort((a, b) => {
            if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
            return a.number - b.number;
        });
    }

    sameTile(t1, t2) {
        return t1.suit === t2.suit && t1.number === t2.number;
    }

    isNextTile(indicator, tile) {
        if (indicator.type === 'honor') {
            const honorOrder = ['east', 'south', 'west', 'north', 'white', 'green', 'red'];
            const idx = honorOrder.indexOf(indicator.value);
            return idx >= 0 && tile.type === 'honor' &&
                tile.value === honorOrder[(idx + 1) % honorOrder.length];
        }

        return indicator.number === 9
            ? tile.suit === indicator.suit && tile.number === 1
            : tile.suit === indicator.suit && tile.number === indicator.number + 1;
    }
}

export default MahjongCalculator;