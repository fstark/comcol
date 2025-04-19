import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComputers } from './api';
import './App.css';

interface MemoryCard {
	id: number;
	computerId: number;
	image: string;
	matched: boolean;
	flipped: boolean;
}

const shuffle = (array: any[]) => {
	let currentIndex = array.length, randomIndex;
	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
};

const MemoryGame: React.FC = () => {
	const [cards, setCards] = useState<MemoryCard[]>([]);
	const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
	const [matchedCount, setMatchedCount] = useState(0);
	const [moves, setMoves] = useState(0);
	const [loading, setLoading] = useState(true);
	const [lockBoard, setLockBoard] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const setupGame = async () => {
			setLoading(true);
			const computers = await fetchComputers();
			const filtered = computers.filter((c: any) => c.pictures && c.pictures.length > 0);
			const selected = shuffle(filtered).slice(0, 8);
			let cardList: MemoryCard[] = [];
			selected.forEach((comp: any, idx: number) => {
				const img = comp.pictures[0].portrait || comp.pictures[0].image;
				cardList.push({ id: idx * 2, computerId: comp.id, image: img, matched: false, flipped: false });
				cardList.push({ id: idx * 2 + 1, computerId: comp.id, image: img, matched: false, flipped: false });
			});
			setCards(shuffle(cardList));
			setMatchedCount(0);
			setMoves(0);
			setFlippedIndices([]);
			setLoading(false);
			setLockBoard(false);
		};
		setupGame();
	}, []);

	const handleCardClick = (index: number) => {
		if (lockBoard || cards[index].flipped || cards[index].matched) return;
		const newFlipped = [...flippedIndices, index];
		const newCards = cards.map((card, i) => (i === index ? { ...card, flipped: true } : card));
		setCards(newCards);
		setFlippedIndices(newFlipped);
		if (newFlipped.length === 2) {
			setLockBoard(true);
			setMoves((m) => m + 1);
			setTimeout(() => {
				const [i1, i2] = newFlipped;
				if (newCards[i1].computerId === newCards[i2].computerId) {
					// Match
					const updated = newCards.map((card, i) =>
						i === i1 || i === i2 ? { ...card, matched: true } : card
					);
					setCards(updated);
					setMatchedCount((c) => c + 1);
				} else {
					// No match
					setCards(newCards.map((card, i) =>
						i === i1 || i === i2 ? { ...card, flipped: false } : card
					));
				}
				setFlippedIndices([]);
				setLockBoard(false);
			}, 1000);
		}
	};

	useEffect(() => {
		if (matchedCount === 8) {
			setTimeout(() => {
				alert(`Congratulations! You finished the Memory game in ${moves} moves.`);
				navigate('/game');
			}, 500);
		}
	}, [matchedCount, moves, navigate]);

	if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;

	return (
		<div className="memory-game" style={{ maxWidth: 420, margin: '40px auto', textAlign: 'center' }}>
			<h1>Memory Game</h1>
			<p>Find all pairs! Moves: {moves}</p>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 120px)', gap: '16px', justifyContent: 'center' }}>
				{cards.map((card, idx) => (
					<div
						key={card.id}
						className={`memory-card${card.flipped || card.matched ? ' flipped' : ''}`}
						style={{
							width: 120,
							height: 120,
							border: '1.5px solid #007bff',
							borderRadius: 12,
							background: card.flipped || card.matched ? '#fff' : '#007bff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: card.flipped || card.matched ? 'default' : 'pointer',
							boxShadow: card.flipped || card.matched ? '0 2px 12px #aaa' : 'none',
							transition: 'background 0.2s',
							overflow: 'hidden',
						}}
						onClick={() => handleCardClick(idx)}
					>
						{(card.flipped || card.matched) ? (
							<img src={card.image} alt="Computer" style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 10 }} />
						) : null}
					</div>
				))}
			</div>
		</div>
	);
};

export default MemoryGame;
