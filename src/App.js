import React, { useState } from 'react';
import MahjongCalculator from './mahjong-calculator';
import ConditionToggle from './ConditionToggle';
import TileSelector from './TileSelector';
import './mahjong.css';

const MahjongUI = () => {
    const [hand, setHand] = useState([]);
    const [melds, setMelds] = useState([]);
    const [kitaCount, setKitaCount] = useState(0);
    const [doraIndicators, setDoraIndicators] = useState([]);
    const [meldInProgress, setMeldInProgress] = useState(null);
    const [result, setResult] = useState(null);
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
        isDealer: false,
        threePlayer: false,
        seatWind: 'east',
        prevalentWind: 'east',
        winningTile: null
    });
    const [availableTiles, setAvailableTiles] = useState(
        Array.from({ length: 34 }, (_, i) => ({
            id: i,
            count: 4,
            type: i < 27 ? 'normal' : 'honor',
            suit: i < 9 ? 'man' : i < 18 ? 'pin' : i < 27 ? 'sou' : null,
            number: i < 27 ? (i % 9) + 1 : null,
            value: i >= 27 ? ['east', 'south', 'west', 'north', 'white', 'green', 'red'][i - 27] : null
        }))
    );

    const calculator = new MahjongCalculator();

    const getTileKey = (tile) => {
        return tile.type === 'honor' ? tile.value : `${tile.suit}${tile.number}`;
    };

    const handleTileSelect = (tile) => {
        if (meldInProgress) {
            handleMeldTileSelect(tile);
            return;
        }

        const tileIdx = availableTiles.findIndex(t =>
            t.type === tile.type &&
            t.suit === tile.suit &&
            t.number === tile.number &&
            t.value === tile.value
        );

        if (tileIdx === -1 || availableTiles[tileIdx].count === 0) return;

        if (hand.length < getMaxHandLength()) {
            setHand([...hand, tile]);
            updateAvailableTiles(tile, -1);
        }
    };

    const getMaxHandLength = () => {
        const meldCount = melds.reduce((acc, meld) => {
            if (meld.type === 'chi' || meld.type === 'pon') return acc + 3;
            if (meld.type === 'kan') return acc + 4;
            return acc;
        }, 0);
        return 14 - meldCount;
    };

    const updateAvailableTiles = (tile, change) => {
        setAvailableTiles(prev => prev.map(t => {
            if (t.type === tile.type &&
                t.suit === tile.suit &&
                t.number === tile.number &&
                t.value === tile.value) {
                return { ...t, count: t.count + change };
            }
            return t;
        }));
    };

    const handleMeldTileSelect = (tile) => {
        if (!meldInProgress) return;

        const updatedMeld = { ...meldInProgress };
        updatedMeld.tiles.push(tile);

        if (updatedMeld.tiles.length === getMeldLength(updatedMeld.type)) {
            setMelds([...melds, updatedMeld]);
            setMeldInProgress(null);
            updatedMeld.tiles.forEach(t => updateAvailableTiles(t, -1));
        } else {
            setMeldInProgress(updatedMeld);
        }
    };

    const getMeldLength = (type) => {
        return type === 'kan' ? 4 : 3;
    };

    const startMeld = (type) => {
        setMeldInProgress({ type, tiles: [] });
    };

    const handleKita = () => {
        if (kitaCount >= 4) return;
        const northTile = availableTiles.find(t => t.type === 'honor' && t.value === 'north');
        if (northTile && northTile.count > 0) {
            setKitaCount(prev => prev + 1);
            updateAvailableTiles(northTile, -1);
        }
    };

    const handleDora = (tile) => {
        if (doraIndicators.length >= 4) return;
        const tileIdx = availableTiles.findIndex(t =>
            t.type === tile.type &&
            t.suit === tile.suit &&
            t.number === tile.number &&
            t.value === tile.value
        );

        if (tileIdx === -1 || availableTiles[tileIdx].count === 0) return;

        setDoraIndicators([...doraIndicators, tile]);
        updateAvailableTiles(tile, -1);
    };

    const handleCalculate = () => {
        if (hand.length + melds.reduce((acc, m) => acc + m.tiles.length, 0) !== 14) return;

        const result = calculator.calculateScore(hand, {
            ...conditions,
            melds,
            kitaCount,
            doraIndicators,
            winningTile: hand[hand.length - 1]
        });

        setResult(result);
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 flex justify-center">
            <div className="w-full max-w-6xl p-8">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                    <h2 className="text-2xl font-bold mb-4">Hand</h2>
                    <div className="flex flex-wrap gap-2">
                        {melds.map((meld, meldIdx) => (
                            <div key={`meld-${meldIdx}`} className="flex gap-1 p-2 bg-gray-100 rounded">
                                {meld.tiles.map((tile, tileIdx) => (
                                    <div key={`${meldIdx}-${tileIdx}`} className="w-16">
                                        <img
                                            src={`/tiles/${getTileKey(tile)}.svg`}
                                            alt={getTileKey(tile)}
                                            className="w-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div className="flex gap-1">
                            {hand.map((tile, idx) => (
                                <div key={idx} className="w-16">
                                    <img
                                        src={`/tiles/${getTileKey(tile)}.svg`}
                                        alt={getTileKey(tile)}
                                        className="w-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                    <h2 className="text-2xl font-bold mb-4">Actions</h2>
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => startMeld('chi')}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                            Chi
                        </button>
                        <button
                            onClick={() => startMeld('pon')}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Pon
                        </button>
                        <button
                            onClick={() => startMeld('kan')}
                            className="px-4 py-2 bg-purple-500 text-white rounded"
                        >
                            Kan (Closed)
                        </button>
                        <button
                            onClick={() => startMeld('kan-open')}
                            className="px-4 py-2 bg-purple-300 text-white rounded"
                        >
                            Kan (Open)
                        </button>
                        <button
                            onClick={handleKita}
                            disabled={kitaCount >= 4}
                            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
                        >
                            Kita ({kitaCount}/4)
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-bold mb-2">Dora Indicators ({doraIndicators.length}/4)</h3>
                        <div className="flex gap-2">
                            {doraIndicators.map((tile, idx) => (
                                <div key={idx} className="w-16">
                                    <img
                                        src={`/tiles/${getTileKey(tile)}.svg`}
                                        alt={getTileKey(tile)}
                                        className="w-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                    <h2 className="text-2xl font-bold mb-4">Tile Selection</h2>
                    <TileSelector
                        availableTiles={availableTiles}
                        onSelect={handleTileSelect}
                        onAddDora={handleDora}
                    />
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
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
                                threePlayer: value
                            })}
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

                <div className="flex gap-4">
                    <button
                        onClick={handleCalculate}
                        disabled={hand.length + melds.reduce((acc, m) => acc + m.tiles.length, 0) !== 14}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                        Calculate
                    </button>
                    <button
                        onClick={() => {
                            setHand([]);
                            setMelds([]);
                            setResult(null);
                            setKitaCount(0);
                            setDoraIndicators([]);
                            setAvailableTiles(prev => prev.map(t => ({ ...t, count: 4 })));
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded"
                    >
                        Clear
                    </button>
                </div>

                {result && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
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
                                    {result.yaku.map((yaku, index) => (
                                        <li key={index}>
                                            {yaku.name} ({yaku.han} han)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold mb-2">Score</p>
                                <p>{result.score} points</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MahjongUI;