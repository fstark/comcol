import React from 'react';
import './ImageTracker.css';

interface ImageTrackerProps {
	images: { id: number; image: string }[];
	onDelete: (id: number) => void;
}

const ImageTracker: React.FC<ImageTrackerProps> = ({ images, onDelete }) => {
	return (
			<div className="image-tracker">
				<h2>Images</h2>
				<div className="image-tracker__container">
					{images.map((img) => (
						<div key={img.id} className="image-tracker__item">
							<img
								src={img.image}
								alt="Computer"
								className="image-tracker__image"
							/>
							<button
								onClick={() => onDelete(img.id)}
								className="image-tracker__delete-button"
							>
								&times;
							</button>
						</div>
					))}
				</div>
			</div>
		);
	};

export default ImageTracker;