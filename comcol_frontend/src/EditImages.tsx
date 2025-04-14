import React, { useState, useEffect } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone'; // Import types from react-dropzone
import { API_BASE_URL } from './api'; // Import the API base URL
import './EditImages.css';

interface EditImagesProps {
	images: { id: number; image: string }[];
	onAdd: (files: { id: number; image: string }[]) => void;
	onDelete: (id: number) => void;
	computerId: number;
	onNavigate?: (direction: 'next' | 'prev') => void; // Added optional onNavigate prop
}

const EditImages: React.FC<EditImagesProps> = ({ images, onAdd, onDelete, computerId, onNavigate }) => {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [expandedImage, setExpandedImage] = useState<string | null>(null);

	const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
		console.log('Files dropped:', acceptedFiles); // Log dropped files
		setSelectedFiles((prev) => [...prev, ...acceptedFiles]);

		// Narrow the event type to DragEvent
		if ('dataTransfer' in event && event.dataTransfer) {
			const items = event.dataTransfer.items;
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item.kind === 'string' && item.type === 'text/uri-list') {
					item.getAsString(async (url: string) => { // Explicitly type url as string
						try {
							const response = await fetch(url);
							const blob = await response.blob();
							const fileName = url.split('/').pop() || 'downloaded_image';
							const file = new File([blob], fileName, { type: blob.type });

							const formData = new FormData();
							formData.append('image', file);
							formData.append('computer', computerId.toString()); // Use dynamic computerId

							const uploadResponse = await fetch(`${API_BASE_URL}upload-picture/`, {
								method: 'POST',
								body: formData,
							});

							if (!uploadResponse.ok) {
								throw new Error('Failed to upload image');
							}

							const data = await uploadResponse.json();
							console.log('Image uploaded successfully:', data); // Log successful upload

							// Update the images list with the new image
							onAdd([{ id: data.id, image: `http://192.168.1.19:8000${data.image}` }]); // Use base URL without /api
						} catch (error) {
							console.error('Error uploading image from URL:', error);
						}
					});
				}
			}
		}

		// Handle local files
		acceptedFiles.forEach(async (file) => {
			const formData = new FormData();
			formData.append('image', file);
			formData.append('computer', computerId.toString()); // Use dynamic computerId

			try {
				const response = await fetch(`${API_BASE_URL}upload-picture/`, {
					method: 'POST',
					body: formData,
				});

				if (!response.ok) {
					throw new Error('Failed to upload image');
				}

				const data = await response.json();
				console.log('Image uploaded successfully:', data); // Log successful upload

				// Update the images list with the new image
				onAdd([{ id: data.id, image: `http://192.168.1.19:8000${data.image}` }]); // Use base URL without /api
			} catch (error) {
				console.error('Error uploading image:', error);
			}
		});
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch(`${API_BASE_URL}pictures/${id}/`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete image');
			}

			console.log(`Image with ID ${id} deleted successfully`);
			onDelete(id); // Update the frontend state after successful deletion
		} catch (error) {
			console.error('Error deleting image:', error);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			'image/*': []
		},
	});

	useEffect(() => {
		const handleGlobalDrop = (event: DragEvent) => {
			event.preventDefault();

			if (event.dataTransfer) {
				const items = event.dataTransfer.items;
				for (let i = 0; i < items.length; i++) {
					const item = items[i];
					if (item.kind === 'string' && item.type === 'text/uri-list') {
						item.getAsString(async (url: string) => {
							try {
								const response = await fetch(url);
								const blob = await response.blob();
								const fileName = url.split('/').pop() || 'downloaded_image';
								const file = new File([blob], fileName, { type: blob.type });

								const formData = new FormData();
								formData.append('image', file);
								formData.append('computer', computerId.toString());

								const uploadResponse = await fetch(`${API_BASE_URL}upload-picture/`, {
									method: 'POST',
									body: formData,
								});

								if (!uploadResponse.ok) {
									throw new Error('Failed to upload image');
								}

								const data = await uploadResponse.json();
								console.log('Image uploaded successfully:', data);

								onAdd([{ id: data.id, image: `http://192.168.1.19:8000${data.image}` }]);
							} catch (error) {
								console.error('Error uploading image from URL:', error);
							}
						});
					}
				}
			}
		};

		const handleGlobalDragOver = (event: DragEvent) => {
			event.preventDefault();
		};

		document.addEventListener('dragover', handleGlobalDragOver);
		document.addEventListener('drop', handleGlobalDrop);

		return () => {
			document.removeEventListener('dragover', handleGlobalDragOver);
			document.removeEventListener('drop', handleGlobalDrop);
		};
	}, [computerId, onAdd]); // Add dependencies

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
			<div className="images-list"> {/* Added boxSizing and adjusted width to account for padding */}
				{images.map((img) => (
					<div key={img.id} className="image-item"> {/* Set fixed size for images in the list */}
						<img
							src={img.image}
							alt="Computer"
							className="image-thumbnail" // Adjusted styles for small images
							onClick={() => setExpandedImage(img.image)}
						/>
						<button
							onClick={() => handleDelete(img.id)}
							className="delete-button"
						>
							&times;
						</button>
					</div>
				))}
			</div>
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
			<div
				{...getRootProps()}
				className="dropzone"
			>
				<input {...getInputProps()} />
				<p>Drag and drop images here, or click to select files</p>
			</div>
		</div>
	);
};

export default EditImages;