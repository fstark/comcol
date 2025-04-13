import React from 'react';

interface ImageTrackerProps {
	images: { id: number; image: string }[];
	onDelete: (id: number) => void;
}

const ImageTracker: React.FC<ImageTrackerProps> = ({ images, onDelete }) => {
	return (
		<div style={{ marginTop: '20px' }}>
			<h2>Images</h2>
			<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
				{images.map((img) => (
					<div key={img.id} style={{ position: 'relative', display: 'inline-block' }}>
						<img
							src={img.image}
							alt="Computer"
							style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '5px' }}
						/>
						<button
							onClick={() => onDelete(img.id)}
							style={{
								position: 'absolute',
								top: '5px',
								right: '5px',
								backgroundColor: 'red',
								color: 'white',
								border: 'none',
								borderRadius: '50%',
								width: '20px',
								height: '20px',
								cursor: 'pointer',
							}}
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