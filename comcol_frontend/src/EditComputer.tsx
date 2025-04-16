import React from 'react';
import { useParams } from 'react-router-dom';
import { updateComputer, deletePicture, deleteComputer, API_BASE_URL } from './api';
import ComputerForm from './ComputerForm';
import EditImages from './EditImages';
import './EditComputer.css';
import useFetchComputer from './useFetchComputer';
import ViewComputer from './ViewComputer';
import { useEditMode } from './EditModeContext';

const EditComputer: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { computer, setComputer } = useFetchComputer(id || '');
	const { editMode } = useEditMode();

	if (!computer) return <p>Loading...</p>;

	return editMode ? (
		<>
			<ComputerForm
				computer={computer}
				setComputer={setComputer}
				onSubmit={async () => {
					if (window.confirm('Are you sure you want to save changes?')) {
						await updateComputer(computer.id, computer);
						window.location.href = '/view';
					}
				}}
				submitLabel="Save Changes"
				onDelete={async () => {
					if (window.confirm('Are you sure you want to delete this computer?')) {
						await deleteComputer(computer.id);
						window.location.href = '/view';
					}
				}}
			/>

			<div className="margin-bottom-20"></div>

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
				onDelete={async (imageId) => {
					await deletePicture(imageId);
					setComputer((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							pictures: prev.pictures.filter((img) => img.id !== imageId),
						};
					});
				}}
				onReorder={async (newOrder) => {
					setComputer((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							pictures: newOrder,
						};
					});

					try {
						await fetch(`${API_BASE_URL}computers/${id}/reorder-images/`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ order: newOrder.map((img) => img.id) }),
						});
						console.log('Image order updated successfully on the server.');
					} catch (error) {
						console.error('Failed to update image order on the server:', error);
					}
				}}
			/>
		</>
	) : (
		<ViewComputer computer={computer} />
	);
};

export default EditComputer;