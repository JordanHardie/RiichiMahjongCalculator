import YakuDetector from './YakuDetector'

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

    calculateScore(hand, conditions) {
        const yakuList = this.yakuDetector.detectYaku(hand, conditions);
        if (yakuList.length === 0) return { score: 0, yaku: [], fu: 0 };

        let totalHan = yakuList.reduce((sum, yaku) => sum + this.yakuDetector.yakuList[yaku].han, 0);
        const isYakuman = yakuList.some(yaku => this.yakuDetector.yakuList[yaku].han === 13);

        const fu = isYakuman ? 0 : this.calculateFu(hand, conditions);
        const payments = this.calculatePayments(totalHan, fu, conditions);

        return {
            score: payments.total,
            payments,
            yaku: yakuList.map(name => ({
                name,
                han: this.yakuDetector.yakuList[name].han
            })),
            fu,
            totalHan
        };
    }

    calculateFu(hand, conditions) {
        let fu = 20;
        if (conditions.tsumo && !this.yakuDetector.isPinfu(hand, conditions)) fu += 2;
        if (conditions.isClosed) fu += 10;

        // Add fu for melds
        conditions.melds?.forEach(meld => {
            if (meld.type === 'triplet') fu += meld.closed ? 4 : 2;
            if (meld.type === 'kan') fu += meld.closed ? 16 : 8;
            if (this.isTerminalOrHonor(meld.tiles[0])) fu *= 2;
        });

        return Math.ceil(fu / 10) * 10;
    }

    isTerminalOrHonor(tile) {
        return tile.type === 'honor' || tile.number === 1 || tile.number === 9;
    }

    calculatePayments(han, fu, conditions) {
        let basePoints;
        if (han >= 13) {
            basePoints = this.limitHands.yakuman.value;
        } else {
            let points = fu * Math.pow(2, han + 2);
            if (points >= this.limitHands.yakuman.value) {
                basePoints = this.limitHands.yakuman.value;
            } else if (points >= this.limitHands.sanbaiman.value) {
                basePoints = this.limitHands.sanbaiman.value;
            } else if (points >= this.limitHands.baiman.value) {
                basePoints = this.limitHands.baiman.value;
            } else if (points >= this.limitHands.haneman.value) {
                basePoints = this.limitHands.haneman.value;
            } else if (points >= this.limitHands.mangan.value) {
                basePoints = this.limitHands.mangan.value;
            } else {
                basePoints = Math.ceil(points / 100) * 100;
            }
        }

        return this.calculateFinalPayments(basePoints, conditions);
    }

    calculateFinalPayments(basePoints, conditions) {
        const payments = {
            dealer: { tsumo: { dealer: 0, nonDealer: 0 }, ron: 0 },
            nonDealer: { tsumo: { dealer: 0, nonDealer: 0 }, ron: 0 }
        };

        const multiplier = conditions.threePlayer ? 3 / 4 : 1;

        if (conditions.isDealer) {
            if (conditions.tsumo) {
                payments.dealer.tsumo.nonDealer = Math.ceil(basePoints * 2 * multiplier / 100) * 100;
            } else {
                payments.dealer.ron = basePoints * 6 * multiplier;
            }
        } else {
            if (conditions.tsumo) {
                payments.nonDealer.tsumo.dealer = Math.ceil(basePoints * 2 * multiplier / 100) * 100;
                payments.nonDealer.tsumo.nonDealer = Math.ceil(basePoints * multiplier / 100) * 100;
            } else {
                payments.nonDealer.ron = basePoints * 4 * multiplier;
            }
        }

        // Calculate total
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

        // Round all payments
        Object.keys(payments).forEach(key => {
            if (typeof payments[key] === 'number') {
                payments[key] = Math.round(payments[key] / 100) * 100;
            } else if (typeof payments[key] === 'object') {
                Object.keys(payments[key]).forEach(subKey => {
                    if (typeof payments[key][subKey] === 'number') {
                        payments[key][subKey] = Math.round(payments[key][subKey] / 100) * 100;
                    } else if (typeof payments[key][subKey] === 'object') {
                        Object.keys(payments[key][subKey]).forEach(subSubKey => {
                            payments[key][subKey][subSubKey] =
                                Math.round(payments[key][subKey][subSubKey] / 100) * 100;
                        });
                    }
                });
            }
        });

        return payments;
    }
}

export default MahjongCalculator;