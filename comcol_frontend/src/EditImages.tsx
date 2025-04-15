import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone'; // Import types from react-dropzone
import { API_BASE_URL, MEDIA_BASE_URL } from './api'; // Import the API and MEDIA base URLs
import './EditImages.css';
import ImageList from './ImageList'; // Import the new ImageList component
import ImageWell from './ImageWell';

interface EditImagesProps {
	images: { id: number; image: string }[];
	onAdd: (files: { id: number; image: string }[]) => void;
	onDelete: (id: number) => void;
	computerId: number;
	onNavigate?: (direction: 'next' | 'prev') => void; // Added optional onNavigate prop
	onReorder: (newOrder: { id: number; image: string }[]) => void;
}

const EditImages: React.FC<EditImagesProps> = ({ images, onAdd, onDelete, computerId, onNavigate, onReorder }) => {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [expandedImage, setExpandedImage] = useState<string | null>(null);

	const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
		console.log('Files dropped:', acceptedFiles); // Log dropped files

		// Existing logic for handling dropped files
		acceptedFiles.forEach(async (file) => {
			const formData = new FormData();
			formData.append('image', file);
			formData.append('computer', computerId.toString());

			try {
				const response = await fetch(`${API_BASE_URL}upload-picture/`, {
					method: 'POST',
					body: formData,
				});

				if (!response.ok) {
					throw new Error('Failed to upload image');
				}

				const data = await response.json();
				console.log('Image uploaded successfully:', data);

				const imageUrl = `${MEDIA_BASE_URL}${data.image}`;
				onAdd([{ id: data.id, image: imageUrl }]);
			} catch (error) {
				console.error('Error uploading image:', error);
			}
		});
	};

	const handleDelete = (id: number) => {
		console.log(`Delete initiated for image ID: ${id}`); // Log the deletion initiation
		onDelete(id); // Delegate deletion responsibility to the parent component
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			'image/*': [],
		},
		noDragEventsBubbling: true, // Prevent drag events from bubbling up
	});

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (expandedImage) {
				switch (event.key) {
					case 'ArrowLeft':
						onNavigate && onNavigate('prev');
						setExpandedImage((prev) => {
							const currentIndex = images.findIndex((img) => img.image === prev);
							const newIndex = (currentIndex - 1 + images.length) % images.length;
							return images[newIndex].image;
						});
						break;
					case 'ArrowRight':
						onNavigate && onNavigate('next');
						setExpandedImage((prev) => {
							const currentIndex = images.findIndex((img) => img.image === prev);
							const newIndex = (currentIndex + 1) % images.length;
							return images[newIndex].image;
						});
						break;
					case 'Escape':
						setExpandedImage(null); // Close zoom on ESC
						break;
					default:
						break;
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [expandedImage, images, onNavigate]);

	return (
		<div className="edit-images-container"> {/* Added boxSizing and adjusted maxWidth to ensure padding is included in the total width */}
			<ImageList images={images} onReorder={onReorder} onDelete={handleDelete} />
			{expandedImage && (
				<div
					className="expanded-image-overlay"
					onClick={() => setExpandedImage(null)}
				>
					<img
						src={expandedImage}
						alt="Expanded"
						className="expanded-image"
					/>
					<div
						className="navigation-buttons"
					>
						<button
							className="nav-button"
							onClick={(e) => {
								e.stopPropagation();
								if (onNavigate) {
									onNavigate('prev');
									setExpandedImage((prev) => {
										const currentIndex = images.findIndex((img) => img.image === prev);
										const newIndex = (currentIndex - 1 + images.length) % images.length;
										return images[newIndex].image;
									});
								}
							}}
						>
							&#8592;
						</button>
						<button
							className="nav-button"
							onClick={(e) => {
								e.stopPropagation();
								if (onNavigate) {
									onNavigate('next');
									setExpandedImage((prev) => {
										const currentIndex = images.findIndex((img) => img.image === prev);
										const newIndex = (currentIndex + 1) % images.length;
										return images[newIndex].image;
									});
								}
							}}
						>
							&#8594;
						</button>
					</div>
				</div>
			)}
			<ImageWell computerId={computerId} onAdd={onAdd} />
			{/* Removed the previous dropzone implementation */}
		</div>
	);
};

export default EditImages;