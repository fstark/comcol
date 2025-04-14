import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchComputers, updateComputer, deletePicture, deleteComputer, uploadPicture } from './api';
import ComputerForm from './ComputerForm';
import EditImages from './EditImages';
import './EditComputer.css';
import useFetchComputer from './useFetchComputer';

interface Computer {
	id: number;
	name: string;
	maker: string;
	year?: number; // Made optional to match the type definition
	description: string;
	url: string;
	pictures: { id: number; image: string }[];
}

const EditComputer: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { computer, setComputer } = useFetchComputer(id || ''); // Ensure id is always a string
	const [expandedImage, setExpandedImage] = useState<string | null>(null);

	const handleSaveComputer = async () => {
		if (computer) {
			await updateComputer(computer.id, computer);
			window.location.href = '/';
		}
	};

	const handleDeleteImage = async (imageId: number) => {
		await deletePicture(imageId);
		setComputer((prev: Computer | null) => {
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
						window.location.href = '/';
					}
				}}
			/>

			<div style={{ marginBottom: '20px' }}></div>

			<EditImages
				images={computer.pictures}
				computerId={computer.id}
				onAdd={(uploadedImages) => {
					setComputer((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							pictures: [...prev.pictures, ...uploadedImages],
						};
					});
				}}
				onDelete={(id) => {
					setComputer((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							pictures: prev.pictures.filter((img) => img.id !== id),
						};
					});
				}}
				onNavigate={(direction) => {
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