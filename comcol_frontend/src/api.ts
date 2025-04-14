import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.19:8000/api/';

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

export const deletePicture = async (id: number): Promise<void> => {
	await axios.delete(`${API_BASE_URL}pictures/${id}/`);
};

export { API_BASE_URL };