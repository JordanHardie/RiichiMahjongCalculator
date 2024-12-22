import React, { useState } from 'react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { Switch } from './components/Switch';

const MahjongCalculatorUI = () => {
  const [hand, setHand] = useState([]);
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  const handleTileSelect = (tile) => {
    if (hand.length < 14) {
      setHand([...hand, tile]);
    }
  };

  const handleClear = () => {
    setHand([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-start justify-center p-8">
      <div className="w-full max-w-6xl">
        <Card className="mb-6 bg-gray-800">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Selected Hand</h2>
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2">
              {hand.map((tile, index) => (
                <div 
                  key={index} 
                  className="aspect-[2/3] bg-white flex-shrink-0"
                  style={{ width: '60px' }}
                >
                  <img 
                    src={`/tiles/${tile.type === 'honor' ? tile.value : tile.suit + tile.number}.svg`}
                    alt="mahjong tile"
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="mb-6 bg-gray-800">
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-9 gap-2 justify-center">
                {numbers.map(num => (
                  <Button 
                    key={`man${num}`}
                    onClick={() => handleTileSelect({ type: 'suit', suit: 'man', number: num })}
                    className="aspect-[2/3] bg-white flex-shrink-0"
                    style={{ width: '60px' }}
                  >
                    <img 
                      src={`/tiles/man${num}.svg`} 
                      alt={`${num} man`}
                      className="w-full h-full object-contain"
                    />
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-9 gap-2 justify-center">
                {numbers.map(num => (
                  <Button 
                    key={`sou${num}`}
                    onClick={() => handleTileSelect({ type: 'suit', suit: 'sou', number: num })}
                    className="aspect-[2/3] bg-white flex-shrink-0"
                    style={{ width: '60px' }}
                  >
                    <img 
                      src={`/tiles/sou${num}.svg`} 
                      alt={`${num} sou`}
                      className="w-full h-full object-contain"
                    />
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-9 gap-2 justify-center">
                {numbers.map(num => (
                  <Button 
                    key={`pin${num}`}
                    onClick={() => handleTileSelect({ type: 'suit', suit: 'pin', number: num })}
                    className="aspect-[2/3] bg-white flex-shrink-0"
                    style={{ width: '60px' }}
                  >
                    <img 
                      src={`/tiles/pin${num}.svg`} 
                      alt={`${num} pin`}
                      className="w-full h-full object-contain"
                    />
                  </Button>
                ))}
              </div>

              <div className="flex justify-center gap-6">
                <div className="flex gap-2">
                  {['white', 'green', 'red'].map(dragon => (
                    <Button
                      key={dragon}
                      onClick={() => handleTileSelect({ type: 'honor', value: dragon })}
                      className="aspect-[2/3] bg-white flex-shrink-0"
                      style={{ width: '60px' }}
                    >
                      <img 
                        src={`/tiles/${dragon}.svg`}
                        alt={dragon}
                        className="w-full h-full object-contain"
                      />
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {['east', 'south', 'west', 'north'].map(wind => (
                    <Button
                      key={wind}
                      onClick={() => handleTileSelect({ type: 'honor', value: wind })}
                      className="aspect-[2/3] bg-white flex-shrink-0"
                      style={{ width: '60px' }}
                    >
                      <img 
                        src={`/tiles/${wind}.svg`}
                        alt={wind}
                        className="w-full h-full object-contain"
                      />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Conditions</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Switch label="Riichi" />
              <Switch label="Double Riichi" />
              <Switch label="Ippatsu" />
              <Switch label="Tsumo" />
              <Switch label="Three Player" />
              <Switch label="Kita" />
              <Switch label="Closed Hand" />
              <Switch label="Dealer" />
            </div>
            <div className="flex gap-4">
              <Button className="flex-1">Calculate</Button>
              <Button onClick={handleClear} variant="outline" className="flex-1">Clear</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MahjongCalculatorUI;
