// TypeScript interfaces extracted for better reusability

export interface Computer {
	id: number;
	name: string;
	maker: string;
	year?: number;
	description?: string;
	pictures: { id: number; image: string }[];
}

export interface ComputerListProps {
	computers: Computer[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}