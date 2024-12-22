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
            // 1 han yaku
            { condition: conditions.riichi && conditions.isClosed, yaku: 'riichi' },
            { condition: this.isTanyao(sortedHand), yaku: 'tanyao' },
            { condition: conditions.tsumo && conditions.isClosed, yaku: 'menzenTsumo' },
            { condition: conditions.seatWind && this.hasValuedPair(patterns, conditions.seatWind), yaku: 'seatWind' },
            { condition: conditions.prevalentWind && this.hasValuedPair(patterns, conditions.prevalentWind), yaku: 'prevalentWind' },
            { condition: this.hasDragonPair(patterns), yaku: 'dragons' },
            { condition: this.isPinfu(patterns, conditions), yaku: 'pinfu' },
            { condition: this.isIipeiko(patterns) && !this.isRyanpeikou(patterns), yaku: 'iipeiko' },
            { condition: conditions.chankan, yaku: 'chankan' },
            { condition: conditions.rinshan, yaku: 'rinshan' },
            { condition: conditions.haitei, yaku: 'haitei' },
            { condition: conditions.houtei, yaku: 'houtei' },
            { condition: conditions.ippatsu && conditions.isClosed, yaku: 'ippatsu' },

            // 2 han yaku
            { condition: conditions.doubleRiichi && conditions.isClosed, yaku: 'doubleRiichi' },
            { condition: this.isSanshokuDouko(patterns), yaku: 'sanshokuDouko' },
            { condition: this.isSankantsu(patterns), yaku: 'sankantsu' },
            { condition: this.isToitoi(patterns), yaku: 'toitoi' },
            { condition: this.isSanankou(patterns), yaku: 'sanankou' },
            { condition: this.isShousangen(patterns), yaku: 'shousangen' },
            { condition: this.isHonroutou(patterns), yaku: 'honroutou' },
            { condition: this.isChiitoi(sortedHand), yaku: 'chiitoi' },
            { condition: this.isChanta(patterns) && !this.isJunchan(patterns), yaku: 'chanta' },
            { condition: this.isIttsuu(patterns), yaku: 'ittsuu' },
            { condition: this.isSanshokuDoujun(patterns), yaku: 'sanshokuDoujun' },

            // 3 han yaku
            { condition: this.isRyanpeikou(patterns), yaku: 'ryanpeikou' },
            { condition: this.isJunchan(patterns), yaku: 'junchan' },
            { condition: this.isHonitsu(sortedHand) && !this.isChinitsu(sortedHand), yaku: 'honitsu' },

            // 6 han yaku
            { condition: this.isChinitsu(sortedHand), yaku: 'chinitsu' },

            // 13 han yaku
            { condition: this.isKokushi(sortedHand), yaku: 'kokushi' },
            { condition: this.isSuuankou(patterns), yaku: 'suuankou' },
            { condition: this.isDaisangen(patterns), yaku: 'daisangen' },
            { condition: this.isChuuren(sortedHand), yaku: 'chuuren' },
            { condition: this.isTsuuiisou(patterns), yaku: 'tsuuiisou' },
            { condition: this.isChinroutou(patterns), yaku: 'chinroutou' },
            { condition: this.isRyuuiisou(patterns), yaku: 'ryuuiisou' },
            { condition: this.isShousuushii(patterns), yaku: 'shousuushii' },
            { condition: this.isDaisuushii(patterns), yaku: 'daisuushii' }
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

    isSanshokuDoujun(patterns) {
        return patterns.some(pattern => {
            const sequences = pattern.sets.filter(set => set.type === 'sequence');
            return sequences.some(seq1 => 
                sequences.some(seq2 => 
                    sequences.some(seq3 => 
                        seq1.tiles[0].suit !== seq2.tiles[0].suit &&
                        seq2.tiles[0].suit !== seq3.tiles[0].suit &&
                        seq1.tiles[0].suit !== seq3.tiles[0].suit &&
                        seq1.tiles[0].number === seq2.tiles[0].number &&
                        seq2.tiles[0].number === seq3.tiles[0].number
                    )
                )
            );
        });
    }

    isIttsuu(patterns) {
        return patterns.some(pattern => {
            const sequences = pattern.sets.filter(set => set.type === 'sequence');
            return sequences.some(seq1 => 
                sequences.some(seq2 => 
                    sequences.some(seq3 => 
                        seq1.tiles[0].number === 1 &&
                        seq2.tiles[0].number === 4 &&
                        seq3.tiles[0].number === 7 &&
                        seq1.tiles[0].suit === seq2.tiles[0].suit &&
                        seq2.tiles[0].suit === seq3.tiles[0].suit
                    )
                )
            );
        });
    }

    isChanta(patterns) {
        return patterns.some(pattern => 
            pattern.sets.every(set => {
                const hasTerminal = set.tiles.some(t => 
                    t.type === 'honor' || t.number === 1 || t.number === 9
                );
                const hasSimple = set.tiles.some(t => 
                    t.type !== 'honor' && t.number > 1 && t.number < 9
                );
                return hasTerminal && hasSimple;
            }) &&
            pattern.pairs[0].some(t => 
                t.type === 'honor' || t.number === 1 || t.number === 9
            )
        );
    }

    isJunchan(patterns) {
        return patterns.some(pattern => 
            pattern.sets.every(set => {
                const hasTerminal = set.tiles.some(t => 
                    t.number === 1 || t.number === 9
                );
                const noHonors = set.tiles.every(t => t.type !== 'honor');
                return hasTerminal && noHonors;
            }) &&
            pattern.pairs[0].every(t => 
                t.type !== 'honor' && (t.number === 1 || t.number === 9)
            )
        );
    }

    isHonroutou(patterns) {
        return patterns.some(pattern => 
            pattern.sets.every(set =>
                set.tiles.every(t => 
                    t.type === 'honor' || t.number === 1 || t.number === 9
                )
            ) &&
            pattern.pairs[0].every(t => 
                t.type === 'honor' || t.number === 1 || t.number === 9
            )
        );
    }

    isShousangen(patterns) {
        return patterns.some(pattern => {
            const dragonSets = pattern.sets.filter(set =>
                set.tiles.every(t => 
                    t.type === 'honor' && ['white', 'green', 'red'].includes(t.value)
                )
            );
            const dragonPair = pattern.pairs[0].every(t =>
                t.type === 'honor' && ['white', 'green', 'red'].includes(t.value)
            );
            return dragonSets.length === 2 && dragonPair;
        });
    }

    isChiitoi(hand) {
        if (hand.length !== 14) return false;
        const pairs = [];
        for (let i = 0; i < hand.length; i += 2) {
            if (!this.sameTile(hand[i], hand[i + 1])) return false;
            if (pairs.some(p => this.sameTile(p[0], hand[i]))) return false;
            pairs.push([hand[i], hand[i + 1]]);
        }
        return pairs.length === 7;
    }

    isSanshokuDouko(patterns) {
        return patterns.some(pattern => {
            const triplets = pattern.sets.filter(set => set.type === 'triplet');
            return triplets.some(trip1 => 
                triplets.some(trip2 => 
                    triplets.some(trip3 => 
                        trip1.tiles[0].suit !== trip2.tiles[0].suit &&
                        trip2.tiles[0].suit !== trip3.tiles[0].suit &&
                        trip1.tiles[0].suit !== trip3.tiles[0].suit &&
                        trip1.tiles[0].number === trip2.tiles[0].number &&
                        trip2.tiles[0].number === trip3.tiles[0].number
                    )
                )
            );
        });
    }

    isKokushi(hand) {
        const requiredTiles = [
            {type: 'honor', value: 'east'}, {type: 'honor', value: 'south'},
            {type: 'honor', value: 'west'}, {type: 'honor', value: 'north'},
            {type: 'honor', value: 'white'}, {type: 'honor', value: 'green'},
            {type: 'honor', value: 'red'},
            {suit: 'man', number: 1}, {suit: 'man', number: 9},
            {suit: 'pin', number: 1}, {suit: 'pin', number: 9},
            {suit: 'sou', number: 1}, {suit: 'sou', number: 9}
        ];
        
        return hand.length === 14 && 
                requiredTiles.every(req => hand.some(t => 
                    (req.type === 'honor' && t.type === 'honor' && t.value === req.value) ||
                    (req.suit && t.suit === req.suit && t.number === req.number)
                ));
    }
    
    isChuuren(hand) {
        if (!this.isChinitsu(hand)) return false;
        const suit = hand[0].suit;
        const required = [1,1,1,2,3,4,5,6,7,8,9,9,9];
        const counts = Array(10).fill(0);
        hand.forEach(t => counts[t.number]++);
        return required.every((req, i) => counts[req] >= 1);
    }
    
    isSuuankou(patterns) {
        return patterns.some(pattern =>
            pattern.sets.filter(set => 
                set.type === 'triplet' && set.closed
            ).length === 4
        );
    }
    
    isDaisangen(patterns) {
        return patterns.some(pattern => {
            const dragonSets = pattern.sets.filter(set =>
                set.tiles.every(t => 
                    t.type === 'honor' && ['white', 'green', 'red'].includes(t.value)
                )
            );
            return dragonSets.length === 3;
        });
    }
    
    isTsuuiisou(hand) {
        return hand.every(t => t.type === 'honor');
    }
    
    isChinroutou(hand) {
        return hand.every(t => 
            t.type !== 'honor' && (t.number === 1 || t.number === 9)
        );
    }
    
    isRyuuiisou(hand) {
        const greenTiles = [
            {suit: 'sou', number: 2},
            {suit: 'sou', number: 3},
            {suit: 'sou', number: 4},
            {suit: 'sou', number: 6},
            {suit: 'sou', number: 8},
            {type: 'honor', value: 'green'}
        ];
        return hand.every(t =>
            greenTiles.some(g =>
                (g.type === 'honor' && t.type === 'honor' && t.value === g.value) ||
                (g.suit && t.suit === g.suit && t.number === g.number)
            )
        );
    }
    
    isShousuushii(patterns) {
        const windSets = pattern => pattern.sets.filter(set =>
            set.tiles.every(t => 
                t.type === 'honor' && ['east', 'south', 'west', 'north'].includes(t.value)
            )
        );
        
        return patterns.some(pattern =>
            windSets(pattern).length === 3 &&
            pattern.pairs[0].every(t =>
                t.type === 'honor' && ['east', 'south', 'west', 'north'].includes(t.value)
            )
        );
    }
    
    isDaisuushii(patterns) {
        return patterns.some(pattern =>
            pattern.sets.filter(set =>
                set.tiles.every(t => 
                    t.type === 'honor' && ['east', 'south', 'west', 'north'].includes(t.value)
                )
            ).length === 4
        );
    }

    hasValuedPair(patterns, wind) {
        return patterns.some(pattern =>
            pattern.pairs[0].every(t => 
                t.type === 'honor' && t.value === wind
            )
        );
    }

    hasDragonPair(patterns) {
        return patterns.some(pattern =>
            pattern.pairs[0].every(t =>
                t.type === 'honor' && ['white', 'green', 'red'].includes(t.value)
            )
        );
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