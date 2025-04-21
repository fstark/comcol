import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComputers } from './api';
import './App.css';

interface Computer {
	id: number;
	name: string;
	pictures: { portrait?: string; image: string }[];
}

const MatchGame: React.FC = () => {
	const [computers, setComputers] = useState<Computer[]>([]);
	const [names, setNames] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [showScore, setShowScore] = useState(false);
	const [score, setScore] = useState(0);
	const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
	const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const setup = async () => {
			setLoading(true);
			const comps: Computer[] = await fetchComputers();
			const withImages = comps.filter(c => c.pictures && c.pictures.length > 0);
			const selected = shuffle(withImages).slice(0, 8);
			setComputers(selected);
			setNames(shuffle(selected.map(c => c.name)));
			setLoading(false);
		};
		setup();
	}, []);

	function shuffle<T>(array: T[]): T[] {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	const handleDragStart = (idx: number) => {
		setDraggedIdx(idx);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
		e.preventDefault();
		if (draggedIdx !== null && draggedIdx !== idx) {
			setDragOverIdx(idx);
		}
	};

	const handleDragLeave = (idx: number) => {
		if (dragOverIdx === idx) setDragOverIdx(null);
	};

	const handleDrop = (targetIdx: number) => {
		if (draggedIdx === null || draggedIdx === targetIdx) return;
		const newNames = [...names];
		[newNames[draggedIdx], newNames[targetIdx]] = [newNames[targetIdx], newNames[draggedIdx]];
		setNames(newNames);
		setDraggedIdx(null);
		setDragOverIdx(null);
	};

	const handleDragEnd = () => {
		setDraggedIdx(null);
		setDragOverIdx(null);
	};

	const handleDone = () => {
		let correct = 0;
		for (let i = 0; i < computers.length; i++) {
			if (computers[i].name === names[i]) correct++;
		}
		setScore(correct);
		setShowScore(true);
		setTimeout(() => {
			navigate('/game');
		}, 2000);
	};

	if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;

	return (
		<div className="match-game" style={{ maxWidth: 900, margin: '40px auto', textAlign: 'center' }}>
			<h1>Match Game</h1>
			<p>Drag a name and drop it onto another to swap them. When done, press the button below.</p>
			<div
				onDragEnd={handleDragEnd}
				style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, margin: '32px 0' }}
			>
				{computers.map((comp, idx) => (
					<div key={comp.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180 }}>
						<img
							src={comp.pictures[0].portrait || comp.pictures[0].image}
							alt={comp.name}
							style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }}
						/>
						<div
							draggable
							onDragStart={() => handleDragStart(idx)}
							onDragOver={e => handleDragOver(e, idx)}
							onDragLeave={() => handleDragLeave(idx)}
							onDrop={() => handleDrop(idx)}
							style={{
								padding: '12px 16px',
								background:
									draggedIdx === idx ? '#e0e4ea' :
										dragOverIdx === idx ? '#ffe082' :
											draggedIdx !== null && draggedIdx !== idx ? '#fffbe6' : '#f8f9fa',
								border: '1.5px solid ' + (dragOverIdx === idx ? '#ffb300' : '#007bff'),
								borderRadius: 8,
								fontWeight: 600,
								color: '#007bff',
								fontSize: '1em',
								marginTop: 4,
								minWidth: 120,
								textAlign: 'center',
								cursor: 'grab',
								opacity: draggedIdx === idx ? 0.6 : 1,
								userSelect: 'none',
								transition: 'background 0.15s, border 0.15s',
							}}
						>
							{names[idx]}
						</div>
					</div>
				))}
			</div>
			<button
				onClick={handleDone}
				style={{ marginTop: 32, padding: '16px 32px', fontSize: '1.2em', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
				disabled={showScore}
			>
				Done
			</button>
			{showScore && (
				<div style={{ marginTop: 24, fontSize: '1.3em', fontWeight: 700 }}>
					Score: {score} / {computers.length}
				</div>
			)}
		</div>
	);
};

export default MatchGame;
