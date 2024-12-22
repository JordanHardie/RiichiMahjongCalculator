import React, { useState } from 'react';
import MahjongCalculator from './mahjong-calculator';
const MahjongUI = () => {
    const [calculator] = useState(new MahjongCalculator());
    const [hand, setHand] = useState([]);
    const [conditions, setConditions] = useState({
        riichi: false,
        doubleRiichi: false,
        ippatsu: false,
        tsumo: false,
        isClosed: true,
        chankan: false,
        rinshan: false,
        haitei: false,
        houtei: false,
        threePlayer: false,
        hasKita: false,
        seatWind: null,
        prevalentWind: null,
        winningTile: null
    });

    const suits = ['man', 'pin', 'sou'];
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const honors = ['east', 'south', 'west', 'north', 'white', 'green', 'red'];

    const addTile = (suit, number, type = 'normal') => {
        if (hand.length >= 14) return;
        setHand([...hand, { suit, number, type }]);
    };

    const removeTile = (index) => {
        const newHand = [...hand];
        newHand.splice(index, 1);
        setHand(newHand);
    };

    const toggleCondition = (condition) => {
        setConditions(prev => ({
            ...prev,
            [condition]: !prev[condition]
        }));
    };

    const calculateScore = () => {
        const yaku = calculator.detectYaku(hand, conditions);
        return yaku.reduce((total, y) => total + y.han, 0);
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">Mahjong Score Calculator</h1>
                </div>

                <div className="space-y-6">
                    {/* Tile Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Select Tiles</h3>
                        <div className="space-y-2">
                            {suits.map(suit => (
                                <div key={suit} className="flex gap-2">
                                    {numbers.map(num => (
                                        <button
                                            key={`${suit}-${num}`}
                                            onClick={() => addTile(suit, num)}
                                            className="w-8 h-8 border rounded hover:bg-gray-100"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            ))}
                            <div className="flex gap-2">
                                {honors.map(honor => (
                                    <button
                                        key={honor}
                                        onClick={() => addTile('honor', 0, honor)}
                                        className="w-8 h-8 border rounded hover:bg-gray-100"
                                    >
                                        {honor[0].toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Current Hand */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Current Hand ({hand.length}/14)</h3>
                        <div className="flex flex-wrap gap-2">
                            {hand.map((tile, index) => (
                                <button
                                    key={index}
                                    onClick={() => removeTile(index)}
                                    className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    {tile.type === 'honor' ? tile.type[0].toUpperCase() : `${tile.number}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Conditions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(conditions).map(condition => (
                                condition !== 'seatWind' && condition !== 'prevalentWind' && condition !== 'winningTile' && (
                                    <div key={condition} className="flex items-center justify-between">
                                        <span className="capitalize">{condition.replace(/([A-Z])/g, ' $1')}</span>
                                        <input
                                            type="checkbox"
                                            checked={conditions[condition]}
                                            onChange={() => toggleCondition(condition)}
                                            className="w-4 h-4"
                                        />
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Score */}
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Score</h3>
                        <p className="text-2xl font-bold">{calculateScore()} han</p>
                    </div>
                </div>
            </div>
        </div>
    );
        isDealer: false,
        threePlayer: false,
export default MahjongUI;        seatWind: 'east',
        prevalentWind: 'east',
        doraIndicators: [],
        winningTile: null
    });
    const [result, setResult] = useState(null);
    const calculator = new MahjongCalculator();

    const handleTileSelect = (tile) => {
        if (hand.length < 14) {
            setHand([...hand, tile]);
            if (hand.length === 13) {
                setConditions(prev => ({ ...prev, winningTile: tile }));
            }
        }
    };

    const handleCalculate = () => {
        if (hand.length !== 14) return;

        const yakuList = calculator.detectYaku(hand, conditions);
        const patterns = calculator.findAllCombinations(hand);
        const fu = calculator.calculateFu({
            melds: patterns[0]?.sets || [],
            pairs: patterns[0]?.pairs || []
        }, conditions);

        const totalHan = yakuList.reduce((sum, yaku) => sum + yaku.han, 0);

        setResult({ yakuList, fu, totalHan });
    };

    const handleClear = () => {
        setHand([]);
        setResult(null);
        setConditions(prev => ({
            ...prev,
            winningTile: null
        }));
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Selected Hand</h2>
                    <div className="flex flex-wrap gap-2">
                        {hand.map((tile, index) => (
                            <div
                                key={index}
                                className="aspect-[2/3] relative"
                                style={{ maxWidth: '80px', width: '100%' }}
                            >
                                <img
                                    src={`/tiles/${tile.type === 'honor' ? tile.value : tile.suit + tile.number}.svg`}
                                    alt="mahjong tile"
                                    className="absolute inset-0 w-full h-full object-contain transform scale-75"
                                    style={{ imageRendering: 'crisp-edges' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Card className="mb-4">
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Tile Selection</h2>
                    <TileSelector onSelect={handleTileSelect} />
                </div>
            </Card>

            <Card className="mb-4">
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Conditions</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <ConditionToggle
                            label="Riichi"
                            value={conditions.riichi}
                            onChange={(value) => setConditions({
                                ...conditions,
                                riichi: value,
                                isClosed: value ? true : conditions.isClosed
                            })}
                        />
                        <ConditionToggle
                            label="Double Riichi"
                            value={conditions.doubleRiichi}
                            onChange={(value) => setConditions({
                                ...conditions,
                                doubleRiichi: value,
                                riichi: value ? true : conditions.riichi,
                                isClosed: value ? true : conditions.isClosed
                            })}
                            disabled={!conditions.riichi}
                        />
                        <ConditionToggle
                            label="Ippatsu"
                            value={conditions.ippatsu}
                            onChange={(value) => setConditions({ ...conditions, ippatsu: value })}
                            disabled={!conditions.riichi}
                        />
                        <ConditionToggle
                            label="Tsumo"
                            value={conditions.tsumo}
                            onChange={(value) => setConditions({ ...conditions, tsumo: value })}
                        />
                        <ConditionToggle
                            label="Three Player"
                            value={conditions.threePlayer}
                            onChange={(value) => setConditions({
                                ...conditions,
                                threePlayer: value,
                                hasKita: value ? conditions.hasKita : false
                            })}
                        />
                        <ConditionToggle
                            label="Kita"
                            value={conditions.hasKita}
                            onChange={(value) => setConditions({ ...conditions, hasKita: value })}
                            disabled={!conditions.threePlayer}
                        />
                        <ConditionToggle
                            label="Closed Hand"
                            value={conditions.isClosed}
                            onChange={(value) => setConditions({ ...conditions, isClosed: value })}
                            disabled={conditions.riichi || conditions.doubleRiichi}
                        />
                        <ConditionToggle
                            label="Dealer"
                            value={conditions.isDealer}
                            onChange={(value) => setConditions({ ...conditions, isDealer: value })}
                        />
                    </div>
                </div>
            </Card>

            <div className="flex gap-4">
                <Button
                    onClick={handleCalculate}
                    className="flex-1"
                    disabled={hand.length !== 14}
                >
                    Calculate
                </Button>
                <Button onClick={handleClear} variant="outline" className="flex-1">
                    Clear
                </Button>
            </div>

            {result && (
                <Card className="mt-4">
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Result</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="font-bold">Total Han</p>
                                    <p>{result.totalHan}</p>
                                </div>
                                <div>
                                    <p className="font-bold">Fu</p>
                                    <p>{result.fu}</p>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold mb-2">Yaku</p>
                                <ul className="space-y-1">
                                    {result.yakuList.map((yaku, index) => (
                                        <li key={index}>
                                            {yaku.name} ({yaku.han} han)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
        isDealer: false,
        threePlayer: false,
export default MahjongCalculatorUI;        prevalentWind: 'east',
        doraIndicators: [],
        winningTile: null
    });
    const [result, setResult] = useState(null);
    const calculator = new MahjongCalculator();

    const handleTileSelect = (tile) => {
        if (hand.length < 14) {
            setHand([...hand, tile]);
            if (hand.length === 13) {
                setConditions(prev => ({ ...prev, winningTile: tile }));
            }
        }
    };

    const handleCalculate = () => {
        if (hand.length !== 14) return;

        const yakuList = calculator.detectYaku(hand, conditions);
        const patterns = calculator.findAllCombinations(hand);
        const fu = calculator.calculateFu({
            melds: patterns[0]?.sets || [],
            pairs: patterns[0]?.pairs || []
        }, conditions);

        const totalHan = yakuList.reduce((sum, yaku) => sum + yaku.han, 0);

        setResult({ yakuList, fu, totalHan });
    };

    const handleClear = () => {
        setHand([]);
        setResult(null);
        setConditions(prev => ({
            ...prev,
            winningTile: null
        }));
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Selected Hand</h2>
                    <div className="flex flex-wrap gap-2">
                        {hand.map((tile, index) => (
                            <div
                                key={index}
                                className="aspect-[2/3] relative"
                                style={{ maxWidth: '80px', width: '100%' }}
                            >
                                <img
                                    src={`/tiles/${tile.type === 'honor' ? tile.value : tile.suit + tile.number}.svg`}
                                    alt="mahjong tile"
                                    className="absolute inset-0 w-full h-full object-contain transform scale-75"
                                    style={{ imageRendering: 'crisp-edges' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Card className="mb-4">
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Tile Selection</h2>
                    <TileSelector onSelect={handleTileSelect} />
                </div>
            </Card>

            <Card className="mb-4">
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Conditions</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <ConditionToggle
                            label="Riichi"
                            value={conditions.riichi}
                            onChange={(value) => setConditions({
                                ...conditions,
                                riichi: value,
                                isClosed: value ? true : conditions.isClosed
                            })}
                        />
                        <ConditionToggle
                            label="Double Riichi"
                            value={conditions.doubleRiichi}
                            onChange={(value) => setConditions({
                                ...conditions,
                                doubleRiichi: value,
                                riichi: value ? true : conditions.riichi,
                                isClosed: value ? true : conditions.isClosed
                            })}
                            disabled={!conditions.riichi}
                        />
                        <ConditionToggle
                            label="Ippatsu"
                            value={conditions.ippatsu}
                            onChange={(value) => setConditions({ ...conditions, ippatsu: value })}
                            disabled={!conditions.riichi}
                        />
                        <ConditionToggle
                            label="Tsumo"
                            value={conditions.tsumo}
                            onChange={(value) => setConditions({ ...conditions, tsumo: value })}
                        />
                        <ConditionToggle
                            label="Three Player"
                            value={conditions.threePlayer}
                            onChange={(value) => setConditions({
                                ...conditions,
                                threePlayer: value,
                                hasKita: value ? conditions.hasKita : false
                            })}
                        />
                        <ConditionToggle
                            label="Kita"
                            value={conditions.hasKita}
                            onChange={(value) => setConditions({ ...conditions, hasKita: value })}
                            disabled={!conditions.threePlayer}
                        />
                        <ConditionToggle
                            label="Closed Hand"
                            value={conditions.isClosed}
                            onChange={(value) => setConditions({ ...conditions, isClosed: value })}
                            disabled={conditions.riichi || conditions.doubleRiichi}
                        />
                        <ConditionToggle
                            label="Dealer"
                            value={conditions.isDealer}
                            onChange={(value) => setConditions({ ...conditions, isDealer: value })}
                        />
                    </div>
                </div>
            </Card>

            <div className="flex gap-4">
                <Button
                    onClick={handleCalculate}
                    className="flex-1"
                    disabled={hand.length !== 14}
                >
                    Calculate
                </Button>
                <Button onClick={handleClear} variant="outline" className="flex-1">
                    Clear
                </Button>
            </div>

            {result && (
                <Card className="mt-4">
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Result</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="font-bold">Total Han</p>
                                    <p>{result.totalHan}</p>
                                </div>
                                <div>
                                    <p className="font-bold">Fu</p>
                                    <p>{result.fu}</p>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold mb-2">Yaku</p>
                                <ul className="space-y-1">
                                    {result.yakuList.map((yaku, index) => (
                                        <li key={index}>
                                            {yaku.name} ({yaku.han} han)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default MahjongCalculatorUI;