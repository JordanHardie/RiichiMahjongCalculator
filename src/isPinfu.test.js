const isPinfu = require('./isPinfu');  // Make sure to export your isPinfu function

describe('Pinfu Hand Tests', () => {
    const conditions = {
        isClosed: true,
        seatWind: null,
        prevalentWind: null,
        winningTile: { number: 5 }
    };

    test('Valid Pinfu hand', () => {
        const patterns = [
            { sets: [{ type: 'sequence', tiles: [{ number: 2 }, { number: 3 }, { number: 4 }] }] }, pairs: [[{ type: 'number', value: 5 }]] }
        ];
    expect(isPinfu(patterns, conditions)).toBe(true);
});

test('Invalid hand: Edge wait', () => {
    const patterns = [
        { sets: [{ type: 'sequence', tiles: [{ number: 1 }, { number: 2 }, { number: 3 }] }] }, pairs: [[{ type: 'number', value: 5 }]] }
        ];
expect(isPinfu(patterns, conditions)).toBe(false);
    });

test('Invalid hand: Middle wait', () => {
    const patterns = [
        { sets: [{ type: 'sequence', tiles: [{ number: 1 }, { number: 3 }, { number: 5 }] }] }, pairs: [[{ type: 'number', value: 5 }]] }
        ];
expect(isPinfu(patterns, conditions)).toBe(false);
    });

test('Invalid hand: Pair is an honor tile', () => {
    const patterns = [
        { sets: [{ type: 'sequence', tiles: [{ number: 2 }, { number: 3 }, { number: 4 }] }] }, pairs: [[{ type: 'honor', value: 'east' }]] }
        ];
expect(isPinfu(patterns, conditions)).toBe(false);
    });
});
