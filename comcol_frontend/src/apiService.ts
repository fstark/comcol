import axios from 'axios';

// Dynamically determine the API base URL based on the frontend's hostname
const API_BASE_URL = `http://${window.location.hostname}:8000/api/`;

export const fetchComputers = async (searchTerm = '') => {
	try {
		const response = await axios.get(`${API_BASE_URL}computers/`, {
			params: { search: searchTerm },
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching computers:', error);
		throw error;
	}
};

export const createComputer = async (computer: { name: string }) => {
	try {
		const formData = new FormData();
		formData.append('name', computer.name);

		const response = await axios.post(`${API_BASE_URL}computers/`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		console.error('Error creating computer:', error);
		throw error;
	}
};

export const updateComputer = async (id: number, computer: any) => {
	try {
		const response = await axios.put(`${API_BASE_URL}computers/${id}/`, computer);
		return response.data;
	} catch (error) {
		console.error('Error updating computer:', error);
		throw error;
	}
};

export const deleteComputer = async (id: number) => {
	try {
		await axios.delete(`${API_BASE_URL}computers/${id}/`);
	} catch (error) {
		console.error('Error deleting computer:', error);
		throw error;
	}
};

export const uploadPicture = async (pictureData: FormData) => {
	try {
		const response = await axios.post(`${API_BASE_URL}upload-picture/`, pictureData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		console.error('Error uploading picture:', error);
		throw error;
	}
};

const pendingDeletes = new Set<number>();

export const deletePicture = async (id: number) => {
	if (pendingDeletes.has(id)) {
		console.warn(`Delete request for picture ID ${id} is already in progress.`);
		return;
	}

	pendingDeletes.add(id);
	try {
		await axios.delete(`${API_BASE_URL}pictures/${id}/`);
		console.log(`Picture ID ${id} deleted successfully.`);
	} catch (error) {
		console.error(`Error deleting picture ID ${id}:`, error);
		throw error;
	} finally {
		pendingDeletes.delete(id);
	}
};