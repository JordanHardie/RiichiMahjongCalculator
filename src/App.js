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
};

export default MahjongUI;