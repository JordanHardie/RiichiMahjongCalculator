class YakuDetector {
    constructor() {
        this.yakuList = {
            // 1 han yaku
            "Riichi": { han: 1, closed: true },
            "All Simples": { han: 1, closed: false },
            "Fully Concealed Hand": { han: 1, closed: true },
            "Seat Wind": { han: 1, closed: false },
            "Prevalent Wind": { han: 1, closed: false },
            "Dragons": { han: 1, closed: false },
            "Pinfu": { han: 1, closed: true },
            "Pure Double Sequence": { han: 1, closed: true },
            "Robbing a Kan": { han: 1, closed: false },
            "After a Kan": { han: 1, closed: false },
            "Under the Sea": { han: 1, closed: false },
            "Under the River": { han: 1, closed: false },
            "Ippatsu": { han: 1, closed: true },

            // 2 han yaku
            "Double Riichi": { han: 2, closed: true },
            "Triple Triplets": { han: 2, closed: false },
            "Three Quads": { han: 2, closed: false },
            "All Triplets": { han: 2, closed: false },
            "Three Concealed Triplets": { han: 2, closed: false },
            "Little Three Dragons": { han: 2, closed: false },
            "All terminals and honors": { han: 2, closed: false },
            "Seven Pairs": { han: 2, closed: true },
            "Half Outside Hand": { han: 2, closed: false },
            "Pure Straight": { han: 2, closed: false },
            "Mixed Triple Sequence": { han: 2, closed: false },

            // 3 han yaku
            "Twice Pure Double Sequence": { han: 3, closed: true },
            "Fully outside hand": { han: 3, closed: false },
            "Half Flush": { han: 3, closed: false },

            // 6 han yaku
            "Full Flush": { han: 6, closed: false },

            // Yakuman (13 han)
            "Thirteen Orphans": { han: 13, closed: true },
            "Nine Gates": { han: 13, closed: true },
            "Four Concealed Triplets": { han: 13, closed: true },
            "Big Three Dragons": { han: 13, closed: false },
            "All Honors": { han: 13, closed: false },
            "All Terminals": { han: 13, closed: false },
            "All Green": { han: 13, closed: false },
            "Four Little Winds": { han: 13, closed: false },
            "Four Big Winds": { han: 13, closed: false },
            "Kazoe Yakuman": { han: 13, closed: false }
        };
    }

    // Main detection method
    detectYaku(hand, conditions) {
        const yakuList = [];
        const sortedHand = this.sortHand(hand);
        const patterns = this.findAllCombinations(sortedHand);

        // Check all yaku in order
        for (const { condition, yaku } of this.getYakuChecks(sortedHand, patterns, conditions)) {
            if (condition) {
                if (this.yakuList[yaku].han === 13) {
                    return [yaku];
                }
                yakuList.push(yaku);
            }
        }

        const totalHan = yakuList.reduce((sum, yaku) => sum + this.yakuList[yaku].han, 0);
        if (totalHan >= 13) {
            return ["Kazoe Yakuman"];
        }

        return yakuList;
    }

    // 1 han yaku methods
    isRiichi(conditions) {
        return conditions.riichi && conditions.isClosed;
    }

    isAllSimples(hand) {
        return hand.every(t =>
            t.type !== 'honor' && t.number > 1 && t.number < 9
        );
    }

    isFullyConcealedHand(conditions) {
        return conditions.tsumo && conditions.isClosed;
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

    isPureDoubleSequence(patterns) {
        return patterns.some(pattern => {
            const sequences = pattern.sets.filter(set => set.type === 'sequence');
            return sequences.some((seq1, i) =>
                sequences.slice(i + 1).some(seq2 =>
                    seq1.tiles.every((t, j) =>
                        this.sameTile(t, seq2.tiles[j])
                    )
                )
            );
        });
    }

    // 2 han yaku methods
    isTripleTriplets(patterns) {
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

    isThreeQuads(patterns) {
        return patterns.some(pattern =>
            pattern.sets.filter(set => set.type === 'quad').length === 3
        );
    }

    isAllTriplets(patterns) {
        return patterns.some(pattern =>
            pattern.sets.every(set => set.type === 'triplet' || set.type === 'quad')
        );
    }

    isThreeConcealedTriplets(patterns) {
        return patterns.some(pattern =>
            pattern.sets.filter(set =>
                (set.type === 'triplet' || set.type === 'quad') && set.closed
            ).length === 3
        );
    }

    isLittleThreeDragons(patterns) {
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

    isAllTerminalsAndHonors(patterns) {
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

    isSevenPairs(hand) {
        if (hand.length !== 14) return false;
        const pairs = [];
        for (let i = 0; i < hand.length; i += 2) {
            if (!this.sameTile(hand[i], hand[i + 1])) return false;
            if (pairs.some(p => this.sameTile(p[0], hand[i]))) return false;
            pairs.push([hand[i], hand[i + 1]]);
        }
        return pairs.length === 7;
    }

    isHalfOutsideHand(patterns) {
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

    isPureStraight(patterns) {
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

    isMixedTripleSequence(patterns) {
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

    // 3 han yaku methods
    isTwicePureDoubleSequence(patterns) {
        return patterns.some(pattern => {
            const sequences = pattern.sets.filter(set => set.type === 'sequence');
            let pairCount = 0;
            for (let i = 0; i < sequences.length - 1; i++) {
                for (let j = i + 1; j < sequences.length; j++) {
                    if (sequences[i].tiles.every((t, k) =>
                        this.sameTile(t, sequences[j].tiles[k])
                    )) {
                        pairCount++;
                    }
                }
            }
            return pairCount === 2;
        });
    }

    isFullyOutsideHand(patterns) {
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

    isHalfFlush(hand) {
        if (hand.length === 0) return false;
        const suit = hand.find(t => t.type !== 'honor')?.suit;
        return hand.every(t => t.type === 'honor' || t.suit === suit);
    }

    // 6 han yaku methods
    isFullFlush(hand) {
        if (hand.length === 0) return false;
        const suit = hand[0].suit;
        return hand.every(t => t.suit === suit);
    }

    // Yakuman methods
    isThirteenOrphans(hand) {
        const requiredTiles = [
            { type: 'honor', value: 'east' }, { type: 'honor', value: 'south' },
            { type: 'honor', value: 'west' }, { type: 'honor', value: 'north' },
            { type: 'honor', value: 'white' }, { type: 'honor', value: 'green' },
            { type: 'honor', value: 'red' },
            { suit: 'man', number: 1 }, { suit: 'man', number: 9 },
            { suit: 'pin', number: 1 }, { suit: 'pin', number: 9 },
            { suit: 'sou', number: 1 }, { suit: 'sou', number: 9 }
        ];

        return hand.length === 14 &&
            requiredTiles.every(req => hand.some(t =>
                (req.type === 'honor' && t.type === 'honor' && t.value === req.value) ||
                (req.suit && t.suit === req.suit && t.number === req.number)
            ));
    }

    isNineGates(hand) {
        if (!this.isFullFlush(hand)) return false;
        const suit = hand[0].suit;
        const required = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9];
        const counts = Array(10).fill(0);
        hand.forEach(t => counts[t.number]++);
        return required.every((req, i) => counts[req] >= 1);
    }

    isFourConcealedTriplets(patterns) {
        return patterns.some(pattern =>
            pattern.sets.filter(set =>
                set.type === 'triplet' && set.closed
            ).length === 4
        );
    }

    isBigThreeDragons(patterns) {
        return patterns.some(pattern => {
            const dragonSets = pattern.sets.filter(set =>
                set.tiles.every(t =>
                    t.type === 'honor' && ['white', 'green', 'red'].includes(t.value)
                )
            );
            return dragonSets.length === 3;
        });
    }

    isAllHonors(hand) {
        return hand.every(t => t.type === 'honor');
    }

    isAllTerminals(hand) {
        return hand.every(t =>
            t.type !== 'honor' && (t.number === 1 || t.number === 9)
        );
    }

    isAllGreen(hand) {
        const greenTiles = [
            { suit: 'sou', number: 2 },
            { suit: 'sou', number: 3 },
            { suit: 'sou', number: 4 },
            { suit: 'sou', number: 6 },
            { suit: 'sou', number: 8 },
            { type: 'honor', value: 'green' }
        ];
        return hand.every(t =>
            greenTiles.some(g =>
                (g.type === 'honor' && t.type === 'honor' && t.value === g.value) ||
                (g.suit && t.suit === g.suit && t.number === g.number)
            )
        );
    }

    isFourLittleWinds(patterns) {
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

    isFourBigWinds(patterns) {
        return patterns.some(pattern =>
            pattern.sets.filter(set =>
                set.tiles.every(t =>
                    t.type === 'honor' && ['east', 'south', 'west', 'north'].includes(t.value)
                )
            ).length === 4
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

    getYakuChecks(sortedHand, patterns, conditions) {
        return [
            // 1 han yaku
            { condition: conditions.riichi && conditions.isClosed, yaku: "Riichi" },
            { condition: this.isAllSimples(sortedHand), yaku: "All Simples" },
            { condition: conditions.tsumo && conditions.isClosed, yaku: "Fully Concealed Hand" },
            { condition: conditions.seatWind && this.hasValuedPair(patterns, conditions.seatWind), yaku: "Seat Wind" },
            { condition: conditions.prevalentWind && this.hasValuedPair(patterns, conditions.prevalentWind), yaku: "Prevalent Wind" },
            { condition: this.hasDragonPair(patterns), yaku: "Dragons" },
            { condition: this.isPinfu(patterns, conditions), yaku: "Pinfu" },
            { condition: this.isPureDoubleSequence(patterns) && !this.isTwicePureDoubleSequence(patterns), yaku: "Pure Double Sequence" },
            { condition: conditions.chankan, yaku: "Robbing a Kan" },
            { condition: conditions.rinshan, yaku: "After a Kan" },
            { condition: conditions.haitei, yaku: "Under the Sea" },
            { condition: conditions.houtei, yaku: "Under the River" },
            { condition: conditions.ippatsu && conditions.isClosed, yaku: "Ippatsu" },

            // 2 han yaku
            { condition: conditions.doubleRiichi && conditions.isClosed, yaku: "Double Riichi" },
            { condition: this.isTripleTriplets(patterns), yaku: "Triple Triplets" },
            { condition: this.isThreeQuads(patterns), yaku: "Three Quads" },
            { condition: this.isAllTriplets(patterns), yaku: "All Triplets" },
            { condition: this.isThreeConcealedTriplets(patterns), yaku: "Three Concealed Triplets" },
            { condition: this.isLittleThreeDragons(patterns), yaku: "Little Three Dragons" },
            { condition: this.isAllTerminalsAndHonors(patterns), yaku: "All terminals and honors" },
            { condition: this.isSevenPairs(sortedHand), yaku: "Seven Pairs" },
            { condition: this.isHalfOutsideHand(patterns) && !this.isFullyOutsideHand(patterns), yaku: "Half Outside Hand" },
            { condition: this.isPureStraight(patterns), yaku: "Pure Straight" },
            { condition: this.isMixedTripleSequence(patterns), yaku: "Mixed Triple Sequence" },

            // 3 han yaku
            { condition: this.isTwicePureDoubleSequence(patterns), yaku: "Twice Pure Double Sequence" },
            { condition: this.isFullyOutsideHand(patterns), yaku: "Fully outside hand" },
            { condition: this.isHalfFlush(sortedHand) && !this.isFullFlush(sortedHand), yaku: "Half Flush" },

            // 6 han yaku
            { condition: this.isFullFlush(sortedHand), yaku: "Full Flush" },

            // Yakuman (13 han)
            { condition: this.isThirteenOrphans(sortedHand), yaku: "Thirteen Orphans" },
            { condition: this.isNineGates(sortedHand), yaku: "Nine Gates" },
            { condition: this.isFourConcealedTriplets(patterns), yaku: "Four Concealed Triplets" },
            { condition: this.isBigThreeDragons(patterns), yaku: "Big Three Dragons" },
            { condition: this.isAllHonors(sortedHand), yaku: "All Honors" },
            { condition: this.isAllTerminals(sortedHand), yaku: "All Terminals" },
            { condition: this.isAllGreen(sortedHand), yaku: "All Green" },
            { condition: this.isFourLittleWinds(patterns), yaku: "Four Little Winds" },
            { condition: this.isFourBigWinds(patterns), yaku: "Four Big Winds" }
        ];
    }
}

export default YakuDetector;