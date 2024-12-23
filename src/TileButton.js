import React from 'react';

const TileButton = ({ suit, number, value, count, onClick, disabled }) => {
    const tileKey = suit ? `${suit}${number}` : value;

    return (
        <button
            onClick={onClick}
            disabled={disabled || count === 0}
            className="relative w-12 h-16 border rounded hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center bg-white"
        >
            <img
                src={`/tiles/${tileKey}.svg`}
                alt={tileKey}
                className="w-10 h-14 object-contain"
            />
            <span className="absolute bottom-0 right-0 text-xs bg-white rounded-full w-4 h-4 flex items-center justify-center">
                {count}
            </span>
        </button>
    );
};

export default TileButton;