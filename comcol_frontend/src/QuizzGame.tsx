import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComputers } from './api';
import './App.css';

interface Computer {
	id: number;
	name: string;
	pictures: { image: string }[];
}

const getRandomElements = (arr: any[], n: number) => {
	const result = [];
	const taken = new Set();
	while (result.length < n && taken.size < arr.length) {
		const idx = Math.floor(Math.random() * arr.length);
		if (!taken.has(idx)) {
			result.push(arr[idx]);
			taken.add(idx);
		}
	}
	return result;
};

const QuizzGame: React.FC = () => {
	const [questions, setQuestions] = useState<any[]>([]);
	const [current, setCurrent] = useState(0);
	const [score, setScore] = useState(0);
	const [choices, setChoices] = useState<string[]>([]);
	const [selected, setSelected] = useState<string | null>(null);
	const [flash, setFlash] = useState<'none' | 'red' | 'green'>('none');
	const [timer, setTimer] = useState(10);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const setup = async () => {
			const computers: Computer[] = await fetchComputers();
			const withImages = computers.filter(c => c.pictures && c.pictures.length > 0);
			const selectedQuestions = getRandomElements(withImages, 10);
			setQuestions(selectedQuestions);
		};
		setup();
	}, []);

	useEffect(() => {
		if (questions.length === 0 || current >= questions.length) return;
		// Pick 4 random wrong choices + 1 correct
		const others = questions.filter((_, idx) => idx !== current);
		let wrongChoices = getRandomElements(others, 4).map(q => q.name);
		const correct = questions[current].name;
		const allChoices = getRandomElements([correct, ...wrongChoices], 5);
		setChoices(allChoices);
		setSelected(null);
		setTimer(10);
		setFlash('none');
		if (timerRef.current) clearInterval(timerRef.current);
		timerRef.current = setInterval(() => {
			setTimer(t => t - 1);
		}, 1000);
		return () => { if (timerRef.current) clearInterval(timerRef.current); };
	}, [current, questions]);

	useEffect(() => {
		if (timer === 0 && questions.length > 0 && current < questions.length) {
			handleAnswer(null);
		}
	}, [timer]);

	const handleAnswer = (choice: string | null) => {
		if (selected !== null) return;
		if (timerRef.current) clearInterval(timerRef.current);
		const correct = questions[current].name;
		if (choice === correct) {
			setScore(s => s + 1);
			setFlash('green');
			setSelected(choice);
			setTimeout(() => {
				setCurrent(c => c + 1);
			}, 500);
		} else {
			setFlash('red');
			setSelected(choice);
			setTimeout(() => {
				setCurrent(c => c + 1);
			}, 500);
		}
	};

	useEffect(() => {
		if (current === 10 && questions.length > 0) {
			setTimeout(() => {
				alert(`Quiz finished! Your score: ${score}/10`);
				navigate('/game');
			}, 500);
		}
	}, [current, questions.length, score, navigate]);

	if (questions.length === 0 || current >= questions.length) {
		return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;
	}

	const q = questions[current];
	const image = q.pictures[0]?.image;

	return (
		<div className="quizz-game" style={{ maxWidth: 900, margin: '40px auto', textAlign: 'center' }}>
			<h1>Quizz Game</h1>
			<p>Question {current + 1} / 10 &nbsp; | &nbsp; Score: {score} &nbsp; | &nbsp; Time: {timer}s</p>
			<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 32 }}>
				<div
					style={{
						width: 480,
						height: 480,
						border: '2px solid #007bff',
						borderRadius: 16,
						background: flash === 'red' ? '#ffdddd' : flash === 'green' ? '#ddffdd' : '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transition: 'background 0.2s',
						overflow: 'hidden',
					}}
				>
					{image && <img src={image} alt="Computer" style={{ maxWidth: 470, maxHeight: 470, objectFit: 'contain', borderRadius: 12 }} />}
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320, maxWidth: 400 }}>
					{choices.map((name, idx) => (
						<button
							key={idx}
							onClick={() => handleAnswer(name)}
							disabled={selected !== null}
							style={{
								padding: '18px',
								fontSize: '1.1em',
								borderRadius: 8,
								border: '1.5px solid #007bff',
								background: selected === name ? (name === q.name ? '#ddffdd' : '#ffdddd') : '#f8f9fa',
								color: '#007bff',
								fontWeight: 600,
								cursor: selected === null ? 'pointer' : 'default',
								transition: 'background 0.2s',
							}}
						>
							{name}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default QuizzGame;
