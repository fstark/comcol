import React from 'react';
import './App.css';
import { Link } from 'react-router-dom';

const GamePage: React.FC = () => {
	return (
		<div className="game-page" style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
			<h1>Choose a Game</h1>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 40 }}>
				<Link to="/memory" className="game-choice-button" style={buttonStyle}>Memory</Link>
				<Link to="/quizz" className="game-choice-button" style={buttonStyle}>Quizz</Link>
				<Link to="/match" className="game-choice-button" style={buttonStyle}>Match</Link>
				<Link to="/puzzle" className="game-choice-button" style={buttonStyle}>Puzzle</Link>
				<Link to="/observation" className="game-choice-button" style={buttonStyle}>Observation</Link>
			</div>
		</div>
	);
};

const buttonStyle = {
	padding: '16px',
	fontSize: '1.2em',
	borderRadius: '8px',
	background: '#f8f9fa',
	border: '1px solid #007bff',
	color: '#007bff',
	textDecoration: 'none',
	fontWeight: 600,
	transition: 'background 0.2s, color 0.2s',
	cursor: 'pointer',
};

export default GamePage;
