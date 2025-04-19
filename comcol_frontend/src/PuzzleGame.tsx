import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComputers } from './api';

interface Computer {
  id: number;
  name: string;
  pictures: { image: string }[];
}

interface Tile {
  idx: number; // 0-14 (15 tiles)
  correctIdx: number;
}

function getShuffledTiles(): Tile[] {
  // Only shuffle the 15 tiles (0-14), empty slot is always at 15 (bottom right)
  let arr = Array.from({ length: 15 }, (_, i) => i);
  let shuffled: number[];
  do {
    shuffled = arr.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } while (!isEvenPermutation(shuffled));
  // Map to tiles: idx is the tile's image part, correctIdx is its current position
  return shuffled.map((idx, i) => ({ idx, correctIdx: i }));
}

// Returns true if the permutation is even (solvable for 4x4 with empty at bottom right)
function isEvenPermutation(arr: number[]): boolean {
  let inv = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inv++;
    }
  }
  return inv % 2 === 0;
}

const PUZZLE_SIZE = 4;
const TILE_SIZE = 96; // px

const PuzzleGame: React.FC = () => {
  const [computer, setComputer] = useState<Computer | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [emptyIdx, setEmptyIdx] = useState(15); // 0-15
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const setup = async () => {
      const computers: Computer[] = await fetchComputers();
      const withImages = computers.filter(c => c.pictures && c.pictures.length > 0);
      const comp = withImages[Math.floor(Math.random() * withImages.length)];
      setComputer(comp);
      const shuffled = getShuffledTiles();
      setTiles(shuffled);
      setEmptyIdx(15);
      setMoves(0);
      setCompleted(false);
    };
    setup();
  }, []);

  const handleTileClick = (tilePos: number) => {
    if (completed) return;
    // tilePos: 0-15, emptyIdx: 0-15
    const [row, col] = [Math.floor(tilePos / 4), tilePos % 4];
    const [emptyRow, emptyCol] = [Math.floor(emptyIdx / 4), emptyIdx % 4];
    if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) || (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
      // Find which tile is at tilePos
      const tileIdx = tiles.findIndex(t => t.correctIdx === tilePos);
      if (tileIdx === -1) return;
      const newTiles = [...tiles];
      newTiles[tileIdx] = { ...newTiles[tileIdx], correctIdx: emptyIdx };
      setTiles(newTiles);
      setEmptyIdx(tilePos);
      setMoves(m => m + 1);
      // Check for completion
      setTimeout(() => {
        if (newTiles.every(t => t.idx === t.correctIdx)) {
          setCompleted(true);
          setTimeout(() => {
            alert(`Puzzle completed in ${moves + 1} moves!`);
            navigate('/game');
          }, 800);
        }
      }, 100);
    }
  };

  // Render the puzzle grid
  const renderTiles = () => {
    const grid = [];
    for (let i = 0; i < 16; i++) {
      if (i === emptyIdx) {
        grid.push(<div key={i} style={{ width: TILE_SIZE, height: TILE_SIZE }} />);
        continue;
      }
      const tile = tiles.find(t => t.correctIdx === i);
      if (!tile || !computer) {
        grid.push(<div key={i} style={{ width: TILE_SIZE, height: TILE_SIZE }} />);
        continue;
      }
      // Calculate background position for the tile
      const src = computer.pictures[0].image;
      const tileRow = Math.floor(tile.idx / 4);
      const tileCol = tile.idx % 4;
      grid.push(
        <div
          key={i}
          onClick={() => handleTileClick(i)}
          style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            backgroundImage: `url(${src})`,
            backgroundSize: `${TILE_SIZE * 4}px ${TILE_SIZE * 4}px`,
            backgroundPosition: `-${tileCol * TILE_SIZE}px -${tileRow * TILE_SIZE}px`,
            border: '1.5px solid #007bff',
            boxSizing: 'border-box',
            display: 'inline-block',
            cursor: completed ? 'default' : 'pointer',
            opacity: completed ? 0.7 : 1,
            borderRadius: 8,
            transition: 'opacity 0.2s',
          }}
        />
      );
    }
    return grid;
  };

  if (!computer) return <div style={{textAlign:'center',marginTop:40}}>Loading...</div>;

  return (
    <div className="puzzle-game" style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
      <h1>Puzzle Game</h1>
      <p>Slide the tiles to complete the image. Moves: {moves}</p>
      <div
        style={{
          width: TILE_SIZE * 4,
          height: TILE_SIZE * 4,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: 0,
          margin: '0 auto',
          background: '#e9ecef',
          borderRadius: 12,
          boxShadow: '0 2px 12px #aaa',
        }}
      >
        {renderTiles()}
      </div>
    </div>
  );
};

export default PuzzleGame;
