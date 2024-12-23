import React from 'react';
import TileButton from './TileButton';

const TileSelector = ({ availableTiles, onSelect, onAddDora }) => {
    const suits = ['man', 'pin', 'sou'];
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const honors = ['east', 'south', 'west', 'north', 'white', 'green', 'red'];

    const handleTileClick = (tile) => {
        onSelect(tile);
    };

    return (
        <div className="space-y-4">
            {suits.map(suit => (
                <div key={suit} className="flex flex-wrap gap-2 items-center">
                    <span className="w-12 text-sm font-medium">{suit}</span>
                    <div className="flex flex-wrap gap-2">
                        {numbers.map(num => {
                            const tile = availableTiles.find(t =>
                                t.type === 'normal' && t.suit === suit && t.number === num
                            );
                            return (
                                <TileButton
                                    key={`${suit}${num}`}
                                    suit={suit}
                                    number={num}
                                    count={tile.count}
                                    onClick={() => handleTileClick(tile)}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="w-12 text-sm font-medium">honors</span>
                <div className="flex flex-wrap gap-2">
                    {honors.map(honor => {
                        const tile = availableTiles.find(t =>
                            t.type === 'honor' && t.value === honor
                        );
                        return (
                            <TileButton
                                key={honor}
                                value={honor}
                                count={tile.count}
                                onClick={() => handleTileClick(tile)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TileSelector;