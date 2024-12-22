import React, { useState } from 'react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { Switch } from './components/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs';
import MahjongCalculator from './mahjong-calculator';

const TileSelector = ({ onSelect }) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const winds = ['east', 'south', 'west', 'north'];
    const dragons = ['white', 'green', 'red'];

    return (
        <Tabs defaultValue="suits">
            <TabsList className="w-full flex justify-center mb-4">
                <TabsTrigger value="suits" className="px-8">Number Tiles</TabsTrigger>
                <TabsTrigger value="honors" className="px-8">Honor Tiles</TabsTrigger>
            </TabsList>

            <TabsContent value="suits">
                <div className="space-y-4">
                    {/* Man (Characters) */}
                    <div className="grid grid-cols-9 gap-2">
                        {numbers.map(num => (
                            <Button
                                key={`man${num}`}
                                onClick={() => onSelect({ type: 'suit', suit: 'man', number: num })}
                                className="aspect-[2/3] p-1 flex items-center justify-center bg-white"
                                style={{ maxWidth: '60px' }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={`/tiles/man${num}.svg`}
                                        alt={`${num} of man`}
                                        className="absolute inset-0 w-full h-full object-contain transform scale-75"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                </div>
                            </Button>
                        ))}
                    </div>

                    {/* Sou (Bamboo) */}
                    <div className="grid grid-cols-9 gap-2">
                        {numbers.map(num => (
                            <Button
                                key={`sou${num}`}
                                onClick={() => onSelect({ type: 'suit', suit: 'sou', number: num })}
                                className="aspect-[2/3] p-1 flex items-center justify-center bg-white"
                                style={{ maxWidth: '60px' }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={`/tiles/sou${num}.svg`}
                                        alt={`${num} of sou`}
                                        className="absolute inset-0 w-full h-full object-contain transform scale-75"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                </div>
                            </Button>
                        ))}
                    </div>

                    {/* Pin (Circles) */}
                    <div className="grid grid-cols-9 gap-2">
                        {numbers.map(num => (
                            <Button
                                key={`pin${num}`}
                                onClick={() => onSelect({ type: 'suit', suit: 'pin', number: num })}
                                className="aspect-[2/3] p-1 flex items-center justify-center bg-white"
                                style={{ maxWidth: '60px' }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={`/tiles/pin${num}.svg`}
                                        alt={`${num} of pin`}
                                        className="absolute inset-0 w-full h-full object-contain transform scale-75"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="honors">
                <div className="space-y-4">
                    {/* Dragons */}
                    <div className="grid grid-cols-7 gap-2 justify-items-center">
                        {dragons.map(dragon => (
                            <Button
                                key={dragon}
                                onClick={() => onSelect({ type: 'honor', value: dragon })}
                                className="aspect-[2/3] p-1 flex items-center justify-center bg-white"
                                style={{ maxWidth: '60px' }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={`/tiles/${dragon}.svg`}
                                        alt={dragon}
                                        className="absolute inset-0 w-full h-full object-contain transform scale-75"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                </div>
                            </Button>
                        ))}
                    </div>

                    {/* Winds */}
                    <div className="grid grid-cols-7 gap-2 justify-items-center">
                        {winds.map(wind => (
                            <Button
                                key={wind}
                                onClick={() => onSelect({ type: 'honor', value: wind })}
                                className="aspect-[2/3] p-1 flex items-center justify-center bg-white"
                                style={{ maxWidth: '60px' }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={`/tiles/${wind}.svg`}
                                        alt={wind}
                                        className="absolute inset-0 w-full h-full object-contain transform scale-75"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
};

const ConditionToggle = ({ label, value, onChange, disabled = false }) => (
    <div className="flex items-center justify-between p-2">
        <span className={disabled ? 'text-gray-400' : ''}>{label}</span>
        <Switch
            checked={value}
            onCheckedChange={onChange}
            disabled={disabled}
        />
    </div>
);

const MahjongCalculatorUI = () => {
    const [hand, setHand] = useState([]);
    const [conditions, setConditions] = useState({
        riichi: false,
        doubleRiichi: false,
        ippatsu: false,
        tsumo: false,
        chankan: false,
        rinshan: false,
        haitei: false,
        houtei: false,
        isClosed: true,
        isDealer: false,
        threePlayer: false,
        hasKita: false,
        seatWind: 'east',
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
};

export default MahjongCalculatorUI;