import React, { useState, useEffect, useRef } from 'react';
import { Computer } from './types';
import './ViewComputer.css';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * ViewComputer component type declaration
 */
export { };

const ViewComputer: React.FC<{ computer: Computer | null }> = ({ computer }) => {
	const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
	const zoomOverlayRef = useRef<HTMLDivElement | null>(null);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const context = searchParams.get('context')?.split(',').map(Number) || [];
	const currentIndex = context.indexOf(computer?.id || -1);

	// Only show favorite banner if ?favorite=1 is present
	const showFavorite = searchParams.get('favorite') === '1';
	const hasFavorite = showFavorite && computer?.favorite && computer.favorite.trim() !== '';

	useEffect(() => {
		if (zoomedImageIndex !== null && zoomOverlayRef.current) {
			zoomOverlayRef.current.focus();
		}
	}, [zoomedImageIndex]);

	if (!computer) return <p>Loading...</p>;

	// Restore missing handlers
	const handleZoom = (index: number) => {
		setZoomedImageIndex(index);
	};

	const handleCloseZoom = () => {
		setZoomedImageIndex(null);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (zoomedImageIndex === null) return;
		if (event.key === 'ArrowLeft') {
			setZoomedImageIndex((prev) => (prev !== null ? (prev - 1 + computer.pictures.length) % computer.pictures.length : null));
		} else if (event.key === 'ArrowRight') {
			setZoomedImageIndex((prev) => (prev !== null ? (prev + 1) % computer.pictures.length : null));
		} else if (event.key === 'Escape') {
			handleCloseZoom();
		}
	};

	const navigateToComputer = (index: number) => {
		if (index >= 0 && index < context.length) {
			navigate(`/view/${context[index]}?context=${context.join(',')}`);
		}
	};

	return (
		<div className="view-computer">
			{hasFavorite && (
				<div className="favorite-banner">
					{computer.favorite}
				</div>
			)}

			{context.length > 0 && currentIndex !== -1 && (
				<div className="context-navigation">
					<button
						disabled={currentIndex === 0}
						onClick={() => navigateToComputer(currentIndex - 1)}
					>
						&#8592;
					</button>
					<span>
						{currentIndex + 1} of {context.length}
					</span>
					<button
						disabled={currentIndex === context.length - 1}
						onClick={() => navigateToComputer(currentIndex + 1)}
					>
						&#8594;
					</button>
				</div>
			)}

			<div className="computer-card" style={{ border: 'none' }}>
				{computer.pictures.length > 0 && (
					<img
						src={computer.pictures[0].portrait || computer.pictures[0].image}
						alt={computer.name}
						className="computer-image"
					/>
				)}
				<div className="computer-details">
					<h1 className="computer-name">
						{computer.name}
						{computer.url && (
							<a
								href={computer.url}
								target="_blank"
								rel="noopener noreferrer"
								className="computer-link"
							>
								🔗
							</a>
						)}
					</h1>
					{computer.maker && (
						<p className="computer-maker">
							{computer.maker} {computer.year && `(${computer.year})`}
						</p>
					)}
					<p className="computer-description">{computer.description}</p>
				</div>
			</div>

			<div className="image-gallery">
				{computer.pictures.map((picture, index) => (
					<img
						key={picture.id}
						src={picture.gallery || picture.image}
						alt="Computer"
						className="gallery-image"
						onClick={() => handleZoom(index)}
					/>
				))}
			</div>

			{zoomedImageIndex !== null && (
				<div
					className="zoom-overlay"
					onClick={handleCloseZoom}
					onKeyDown={handleKeyDown}
					tabIndex={0} // Make the overlay focusable to capture key events
					ref={zoomOverlayRef} // Attach the ref to the overlay
				>
					<img
						src={computer.pictures[zoomedImageIndex].image}
						alt="Zoomed"
						className="zoomed-image"
					/>
					<button
						className="nav-button prev-button"
						onClick={(e) => {
							e.stopPropagation();
							setZoomedImageIndex((prev) => (prev !== null ? (prev - 1 + computer.pictures.length) % computer.pictures.length : null));
						}}
					>
						&#8592;
					</button>
					<button
						className="nav-button next-button"
						onClick={(e) => {
							e.stopPropagation();
							setZoomedImageIndex((prev) => (prev !== null ? (prev + 1) % computer.pictures.length : null));
						}}
					>
						&#8594;
					</button>
				</div>
			)}
		</div>
	);
};

export default ViewComputer;