import axios from 'axios';

// Use the same origin and subpath for API and media
const API_BASE_URL = `${window.location.origin}/computers/api/`;
const MEDIA_BASE_URL = `${window.location.origin}/computers/media/`;

export const fetchComputers = async (searchTerm = '') => {
	const response = await axios.get(`${API_BASE_URL}computers/`, {
		params: { search: searchTerm },
	});
	return response.data;
};

interface Computer {
	id?: number;
	name: string;
	maker: string;
	year?: number;
	description?: string;
	images?: File[];
}

interface Picture {
	id: number;
	image: string;
}

export const createComputer = async (computer: { name: string }): Promise<Computer> => {
	const formData = new FormData();
	formData.append('name', computer.name);

	const response = await axios.post(`${API_BASE_URL}computers/`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

export const updateComputer = async (id: number, computer: Computer) => {
	const response = await axios.put(`${API_BASE_URL}computers/${id}/`, computer);
	return response.data;
};

export const deleteComputer = async (id: number): Promise<void> => {
	await axios.delete(`${API_BASE_URL}computers/${id}/`);
};

export const uploadPicture = async (pictureData: FormData): Promise<Picture> => {
	const response = await axios.post(`${API_BASE_URL}upload-picture/`, pictureData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
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

export const fetchSettings = async () => {
	const response = await axios.get(`${API_BASE_URL}settings/`);
	return response.data;
};

export { API_BASE_URL, MEDIA_BASE_URL };