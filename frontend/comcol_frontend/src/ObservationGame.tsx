import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComputers } from './api';

interface Computer {
	id: number;
	name: string;
	pictures: { image: string }[];
}

const TILE_SIZE = 48; // px for detail and for computer images (smaller)
const DETAIL_GRID = 4;
const ROUNDS = 10;
const TIME_LIMIT = 60; // seconds
const DETAIL_SIZE = 200; // px for the detail zone

function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

const ObservationGame: React.FC = () => {
	const [computers, setComputers] = useState<Computer[]>([]);
	const [order, setOrder] = useState<number[]>([]);
	const [round, setRound] = useState(0);
	const [score, setScore] = useState(0);
	const [detail, setDetail] = useState<{ compIdx: number, tileIdx: number } | null>(null);
	const [selected, setSelected] = useState<number | null>(null);
	const [timer, setTimer] = useState(TIME_LIMIT);
	const [flash, setFlash] = useState<'none' | 'red' | 'green'>('none');
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const navigate = useNavigate();

	// Setup game
	useEffect(() => {
		const setup = async () => {
			const comps: Computer[] = await fetchComputers();
			const withImages = comps.filter(c => c.pictures && c.pictures.length > 0);
			const chosen = [];
			const used = new Set();
			while (chosen.length < 8 && used.size < withImages.length) {
				const idx = getRandomInt(withImages.length);
				if (!used.has(idx)) {
					chosen.push(withImages[idx]);
					used.add(idx);
				}
			}
			setComputers(chosen);
			setOrder(shuffle(Array.from({ length: 8 }, (_, i) => i)));
			setRound(0);
			setScore(0);
			setSelected(null);
			setFlash('none');
		};
		setup();
	}, []);

	// Setup each round
	useEffect(() => {
		if (computers.length !== 8 || round >= ROUNDS) return;
		// Only pick a detail from one of the 8 displayed computers
		const compIdx = order[getRandomInt(8)];
		const tileIdx = getRandomInt(16);
		setDetail({ compIdx, tileIdx });
		setSelected(null);
		setTimer(TIME_LIMIT);
		setFlash('none');
		if (timerRef.current) clearInterval(timerRef.current);
		timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
		return () => { if (timerRef.current) clearInterval(timerRef.current); };
	}, [computers, round]);

	useEffect(() => {
		if (timer === 0 && detail && selected === null) {
			handleSelect(-1);
		}
	}, [timer]);

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	const handleSelect = (idx: number) => {
		if (selected !== null) return;
		if (timerRef.current) clearInterval(timerRef.current);
		setSelected(idx);
		if (detail && idx === detail.compIdx) {
			setScore(s => s + 1);
			setFlash('green');
		} else {
			setFlash('red');
		}
		setTimeout(() => {
			setRound(r => r + 1);
		}, 700);
	};

	useEffect(() => {
		if (round === ROUNDS) {
			setTimeout(() => {
				alert(`Observation finished! Your score: ${score}/${ROUNDS}`);
				navigate('/game');
			}, 700);
		}
	}, [round, score, navigate]);

	// Helper to get the center square crop style for the 8 images
	function getCenterCropStyle(image: string) {
		return {
			width: TILE_SIZE * DETAIL_GRID,
			height: TILE_SIZE * DETAIL_GRID,
			objectFit: 'cover',
			objectPosition: 'center',
			borderRadius: 12,
			border: '2px solid #007bff',
			background: '#fff',
			boxShadow: '0 2px 8px #aaa',
			marginBottom: 8,
		};
	}

	// Helper to get the detail tile style, cropping from the square center
	function getDetailStyle(image: string, tileIdx: number) {
		// The detail is a 100x100 region from the center square, which is 4x4 tiles
		// The backgroundSize is 400x400 (100*4), and the offset is -col*100, -row*100
		const row = Math.floor(tileIdx / DETAIL_GRID);
		const col = tileIdx % DETAIL_GRID;
		return {
			width: DETAIL_SIZE,
			height: DETAIL_SIZE,
			backgroundImage: `url(${image})`,
			backgroundSize: `${DETAIL_SIZE * DETAIL_GRID}px ${DETAIL_SIZE * DETAIL_GRID}px`,
			backgroundPosition: `-${col * DETAIL_SIZE}px -${row * DETAIL_SIZE}px`,
			backgroundRepeat: 'no-repeat',
			border: '2px solid #007bff',
			borderRadius: 8,
			boxSizing: 'border-box',
			display: 'inline-block',
		};
	}

	if (computers.length !== 8 || !detail) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;

	return (
		<div className="observation-game" style={{ maxWidth: 700, margin: '40px auto', textAlign: 'center' }}>
			<h1>Observation Game</h1>
			<p>Round {round + 1} / {ROUNDS} &nbsp; | &nbsp; Score: {score} &nbsp; | &nbsp; Time: {timer}s</p>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
				{order.map((i, idx) => (
					<div key={i} style={{ width: TILE_SIZE * DETAIL_GRID, margin: 4, textAlign: 'center' }}>
						<img
							src={computers[i].pictures[0].image}
							alt={computers[i].name}
							style={getCenterCropStyle(computers[i].pictures[0].image) as React.CSSProperties}
							onClick={() => selected === null && handleSelect(i)}
							tabIndex={0}
							role="button"
							aria-label={`Select ${computers[i].name}`}
						/>
						<div style={{ fontSize: 13, marginTop: 2 }}>{computers[i].name}</div>
					</div>
				))}
			</div>
			<div style={{ margin: '32px 0 16px', fontWeight: 600 }}>Where does this detail come from?</div>
			<div
				key={round} // force remount to avoid animation and blanking issues
				style={{
					...(getDetailStyle(computers[detail.compIdx].pictures[0].image, detail.tileIdx) as React.CSSProperties),
					margin: '0 auto 24px',
					backgroundColor: flash === 'red' ? '#ffdddd' : flash === 'green' ? '#ddffdd' : '#fff',
				}}
			/>
		</div>
	);
};

export default ObservationGame;
