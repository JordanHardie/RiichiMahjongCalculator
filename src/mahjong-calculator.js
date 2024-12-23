class MahjongCalculator {
    constructor() {
        this.yakuDetector = new YakuDetector();
        this.limitHands = {
            mangan: { value: 8000, han: 5 },
            haneman: { value: 12000, han: 6 },
            baiman: { value: 16000, han: 8 },
            sanbaiman: { value: 24000, han: 11 },
            yakuman: { value: 32000, han: 13 }
        };
    }

    calculateFu(hand, conditions) {
        let fu = 20; // Base fu

        if (conditions.tsumo && !this.yakuDetector.isPinfu(hand, conditions)) fu += 2;
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

    detectYaku(hand, conditions) {
        return this.yakuDetector.detectYaku(hand, conditions);
    }

    calculateScore(hand, conditions) {
        const yaku = this.detectYaku(hand, conditions);
        if (yaku.length === 0) return 0;

        let totalHan = 0;
        let isYakuman = false;

        // Check if any yakuman or if total han reaches yakuman level
        for (const yakuName of yaku) {
            const han = this.yakuDetector.yakuList[yakuName].han;
            if (han === 13) {
                isYakuman = true;
                break;
            }
            totalHan += han;
        }

        // Calculate fu if not yakuman
        const fu = isYakuman ? 0 : this.calculateFu(hand, conditions);

        // Determine base value
        let basePoints;
        if (isYakuman) {
            basePoints = this.limitHands.yakuman.value;
        } else {
            // Calculate basic points (fu × 2^(han+2))
            let basicPoints = fu * Math.pow(2, totalHan + 2);

            // Apply limits
            if (basicPoints >= this.limitHands.yakuman.value || totalHan >= this.limitHands.yakuman.han) {
                return this.calculatePayment(this.limitHands.yakuman.value, conditions); // Kazoe Yakuman
            } else if (basicPoints >= this.limitHands.sanbaiman.value || totalHan >= this.limitHands.sanbaiman.han) {
                basePoints = this.limitHands.sanbaiman.value;
            } else if (basicPoints >= this.limitHands.baiman.value || totalHan >= this.limitHands.baiman.han) {
                basePoints = this.limitHands.baiman.value;
            } else if (basicPoints >= this.limitHands.haneman.value || totalHan >= this.limitHands.haneman.han) {
                basePoints = this.limitHands.haneman.value;
            } else if (basicPoints >= this.limitHands.mangan.value || totalHan >= this.limitHands.mangan.han) {
                basePoints = this.limitHands.mangan.value;
            } else {
                basePoints = Math.ceil(basicPoints / 100) * 100;
            }
        }

        return this.calculatePayment(basePoints, conditions);
    }

    calculatePayment(basePoints, conditions) {
        const payments = {
            dealer: {
                tsumo: { dealer: 0, nonDealer: 0 },
                ron: 0
            },
            nonDealer: {
                tsumo: { dealer: 0, nonDealer: 0 },
                ron: 0
            }
        };

        // 3 player rules modify the payments
        if (conditions.threePlayer) {
            if (conditions.isDealer) {
                if (conditions.tsumo) {
                    payments.dealer.tsumo.nonDealer = Math.ceil(basePoints * 2 / 100) * 100;
                } else {
                    payments.dealer.ron = basePoints * 6;
                }
            } else {
                if (conditions.tsumo) {
                    payments.nonDealer.tsumo.dealer = Math.ceil(basePoints * 2 / 100) * 100;
                    payments.nonDealer.tsumo.nonDealer = Math.ceil(basePoints / 100) * 100;
                } else {
                    payments.nonDealer.ron = basePoints * 4;
                }
            }
        } else {
            if (conditions.isDealer) {
                if (conditions.tsumo) {
                    payments.dealer.tsumo.nonDealer = Math.ceil(basePoints * 2 / 100) * 100;
                } else {
                    payments.dealer.ron = basePoints * 6;
                }
            } else {
                if (conditions.tsumo) {
                    payments.nonDealer.tsumo.dealer = Math.ceil(basePoints * 2 / 100) * 100;
                    payments.nonDealer.tsumo.nonDealer = Math.ceil(basePoints / 100) * 100;
                } else {
                    payments.nonDealer.ron = basePoints * 4;
                }
            }
        }

        // Add total field for convenience
        if (conditions.tsumo) {
            if (conditions.isDealer) {
                payments.total = payments.dealer.tsumo.nonDealer * (conditions.threePlayer ? 2 : 3);
            } else {
                payments.total = payments.nonDealer.tsumo.dealer +
                    (payments.nonDealer.tsumo.nonDealer * (conditions.threePlayer ? 1 : 2));
            }
        } else {
            payments.total = conditions.isDealer ? payments.dealer.ron : payments.nonDealer.ron;
        }

        // Round all payments to nearest 100
        Object.keys(payments).forEach(key => {
            if (typeof payments[key] === 'number') {
                payments[key] = Math.round(payments[key] / 100) * 100;
            } else if (typeof payments[key] === 'object') {
                Object.keys(payments[key]).forEach(subKey => {
                    if (typeof payments[key][subKey] === 'number') {
                        payments[key][subKey] = Math.round(payments[key][subKey] / 100) * 100;
                    } else if (typeof payments[key][subKey] === 'object') {
                        Object.keys(payments[key][subKey]).forEach(subSubKey => {
                            payments[key][subKey][subSubKey] = Math.round(payments[key][subKey][subSubKey] / 100) * 100;
                        });
                    }
                });
            }
        });

        return payments;
    }
}

export default MahjongCalculator;