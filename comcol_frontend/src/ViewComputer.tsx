import React, { useState, useEffect, useRef } from 'react';
import { Computer } from './types';
import './ViewComputer.css';

/**
 * ViewComputer component type declaration
 */
export {};

const ViewComputer: React.FC<{ computer: Computer | null }> = ({ computer }) => {
	const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
	const zoomOverlayRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (zoomedImageIndex !== null && zoomOverlayRef.current) {
			zoomOverlayRef.current.focus();
		}
	}, [zoomedImageIndex]);

	if (!computer) return <p>Loading...</p>;

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

	return (
		<div className="view-computer">
			<div className="computer-card" style={{ border: 'none' }}>
				{computer.pictures.length > 0 && (
					<img
						src={computer.pictures[0].image}
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
						src={picture.image}
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