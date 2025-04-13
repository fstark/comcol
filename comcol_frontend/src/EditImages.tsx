import React, { useState, useEffect } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone'; // Import types from react-dropzone
import { API_BASE_URL } from './api'; // Import the API base URL

interface EditImagesProps {
	images: { id: number; image: string }[];
	onAdd: (files: { id: number; image: string }[]) => void; // Updated type
	onDelete: (id: number) => void;
	computerId: number; // Added computerId prop
}

const EditImages: React.FC<EditImagesProps> = ({ images, onAdd, onDelete, computerId }) => {
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
							onAdd([{ id: data.id, image: `http://localhost:8000${data.image}` }]); // Use base URL without /api
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
				onAdd([{ id: data.id, image: `http://localhost:8000${data.image}` }]); // Use base URL without /api
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

								onAdd([{ id: data.id, image: `http://localhost:8000${data.image}` }]);
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

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', boxSizing: 'border-box', maxWidth: '100%', margin: '0 auto' }}> {/* Added boxSizing and adjusted maxWidth to ensure padding is included in the total width */}
			<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px', boxSizing: 'border-box', width: '100%' }}> {/* Added boxSizing and adjusted width to account for padding */}
				{images.map((img) => (
					<div key={img.id} style={{ position: 'relative', display: 'inline-block', width: '100px', height: '100px' }}> {/* Set fixed size for images in the list */}
						<img
							src={img.image}
							alt="Computer"
							// Updated styles for full width
							style={{ width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' }} // Adjusted styles for small images
							onClick={() => setExpandedImage(img.image)}
						/>
						<button
							onClick={() => handleDelete(img.id)}
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
			{expandedImage && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 1000,
					}}
					onClick={() => setExpandedImage(null)}
				>
					<img
						src={expandedImage}
						alt="Expanded"
						style={{
							maxWidth: '100%',
							maxHeight: '90%',
							borderRadius: '10px',
							padding: '10px', // Add padding
							width: '100%', // Make the image take the full page width
						}}
					/>
				</div>
			)}
			<div
				{...getRootProps()}
				style={{
					border: '2px dashed #007bff',
					padding: '20px',
					textAlign: 'center',
					borderRadius: '5px',
					cursor: 'pointer',
				}}
			>
				<input {...getInputProps()} />
				<p>Drag and drop images here, or click to select files</p>
			</div>
		</div>
	);
};

export default EditImages;