import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchComputers, updateComputer, deletePicture, deleteComputer, uploadPicture } from './api';
import ComputerForm from './ComputerForm';
import EditImages from './EditImages';
import './EditComputer.css';

interface Computer {
	id: number;
	name: string;
	maker: string;
	year: number | undefined; // Updated to match the expected type in ComputerForm
	description: string;
	url: string;
	pictures: { id: number; image: string }[];
}

const EditComputer: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [computer, setComputer] = useState<Computer | null>(null);
	const [expandedImage, setExpandedImage] = useState<string | null>(null); // Added state for expanded image

	useEffect(() => {
		let isMounted = true; // Track if the component is still mounted

		const loadComputer = async () => {
			const computers = await fetchComputers();
			if (isMounted) {
				const selectedComputer = computers.find((comp: Computer) => comp.id === parseInt(id || '0', 10));
				setComputer(selectedComputer || null);
			}
		};
		loadComputer();

		return () => {
			isMounted = false; // Cleanup on unmount
		};
	}, [id]);

	const handleSaveComputer = async () => {
		if (computer) {
			await updateComputer(computer.id, computer);
			window.location.href = '/'; // Redirect to the list directly after saving
		}
	};

	const handleDeleteImage = async (imageId: number) => {
		await deletePicture(imageId);
		setComputer((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				pictures: prev.pictures.filter((img) => img.id !== imageId),
			};
		});
	};

	if (!computer) return <p>Loading...</p>;

	return (
		<>
			<ComputerForm
				computer={computer}
				setComputer={setComputer}
				onSubmit={handleSaveComputer}
				submitLabel="Save Changes"
				onDelete={async () => {
					if (window.confirm('Are you sure you want to delete this computer?')) {
						await deleteComputer(computer.id);
						window.location.href = '/'; // Redirect to the list directly after deletion
					}
				}}
			/>

			{/* Add spacing between the form and the list of images */}
			<div style={{ marginBottom: '20px' }}></div>

			<EditImages
				images={computer.pictures}
				computerId={computer.id} // Pass the current computer's ID
				onAdd={(uploadedImages: { id: number; image: string }[]) => {
					setComputer((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							pictures: [...prev.pictures, ...uploadedImages],
						};
					});
				}}
				onDelete={(id: number) => {
					setComputer((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							pictures: prev.pictures.filter((img) => img.id !== id),
						};
						});
					}}
				// Add navigation for next/prev image
				onNavigate={(direction: 'next' | 'prev') => {
					setComputer((prev) => {
						if (!prev) return prev;
						const currentIndex = prev.pictures.findIndex((img) => img.image === expandedImage);
						if (currentIndex === -1) return prev;
						const newIndex = direction === 'next'
							? (currentIndex + 1) % prev.pictures.length
							: (currentIndex - 1 + prev.pictures.length) % prev.pictures.length;
						setExpandedImage(prev.pictures[newIndex].image);
						return prev;
					});
				}}
			/>
		</>
	);
};

export default EditComputer;