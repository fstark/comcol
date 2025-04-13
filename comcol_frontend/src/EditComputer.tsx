import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchComputers, updateComputer, deletePicture, deleteComputer, uploadPicture } from './api';
import ComputerForm from './ComputerForm';
import EditImages from './EditImages';

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

	useEffect(() => {
		const loadComputer = async () => {
			const computers = await fetchComputers();
			const selectedComputer = computers.find((comp: Computer) => comp.id === parseInt(id || '0', 10));
			setComputer(selectedComputer || null);
		};
		loadComputer();
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
			/>
		</>
	);
};

export default EditComputer;