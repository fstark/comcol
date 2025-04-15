import React, { memo, useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './EditImages.css';

interface ImageListProps {
	images: { id: number; image: string }[];
	onReorder: (newOrder: { id: number; image: string }[]) => void;
	onDelete: (id: number) => void;
}

const ImageList: React.FC<ImageListProps> = ({ images, onReorder, onDelete }) => {
	const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
	const zoomOverlayRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (zoomedImageIndex !== null && zoomOverlayRef.current) {
			zoomOverlayRef.current.focus();
		}
	}, [zoomedImageIndex]);

	useEffect(() => {
		const preventDrop: EventListener = (event) => {
			event.preventDefault();
			event.stopPropagation(); // Ensure the event does not propagate further
		};

		const imageListElement = document.querySelector('.images-list');
		imageListElement?.addEventListener('dragover', preventDrop);
		imageListElement?.addEventListener('drop', preventDrop);

		return () => {
			imageListElement?.removeEventListener('dragover', preventDrop);
			imageListElement?.removeEventListener('drop', preventDrop);
		};
	}, []);

	const handleDragEnd = (result: any) => {
		if (!result.destination) return;

		const reorderedImages = Array.from(images);
		const [removed] = reorderedImages.splice(result.source.index, 1);
		reorderedImages.splice(result.destination.index, 0, removed);

		onReorder(reorderedImages);
	};

	const handleZoom = (index: number) => {
		setZoomedImageIndex(index);
	};

	const handleCloseZoom = () => {
		setZoomedImageIndex(null);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (zoomedImageIndex === null) return;

		if (event.key === 'ArrowLeft') {
			setZoomedImageIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
		} else if (event.key === 'ArrowRight') {
			setZoomedImageIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
		} else if (event.key === 'Escape') {
			handleCloseZoom();
		}
	};

	return (
		<>
			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable droppableId="images" direction="horizontal">
					{(provided) => (
						<div
							className="images-list"
							{...provided.droppableProps}
							ref={provided.innerRef}
						>
							{images.map((img, index) => (
								<Draggable key={img.id} draggableId={img.id.toString()} index={index}>
									{(provided) => (
										<div
											className="image-item"
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
										>
											<img
												src={img.image}
												alt="Computer"
												className="image-thumbnail"
												onClick={() => handleZoom(index)}
											/>
											<button
												onClick={(e) => {
													e.stopPropagation(); // Prevent event bubbling
													console.log(`Delete button clicked for image ID: ${img.id}`); // Log button click
													onDelete(img.id);
												}}
												className="delete-button"
											>
												&times;
											</button>
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>

			{zoomedImageIndex !== null && (
				<div
					className="zoom-overlay"
					onClick={handleCloseZoom}
					onKeyDown={handleKeyDown}
					tabIndex={0} // Make the overlay focusable to capture key events
					ref={zoomOverlayRef} // Attach the ref to the overlay
				>
					<img
						src={images[zoomedImageIndex].image}
						alt="Zoomed"
						className="zoomed-image"
					/>
					<button
						className="nav-button prev-button"
						onClick={(e) => {
							e.stopPropagation();
							setZoomedImageIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
						}}
					>
						&#8592;
					</button>
					<button
						className="nav-button next-button"
						onClick={(e) => {
							e.stopPropagation();
							setZoomedImageIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
						}}
					>
						&#8594;
					</button>
				</div>
			)}
		</>
	);
};

export default memo(ImageList);