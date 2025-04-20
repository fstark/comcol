// TypeScript interfaces extracted for better reusability

export interface Picture {
	id: number;
	image: string;
	thumb?: string;
	gallery?: string;
	portrait?: string;
}

export interface Computer {
	id: number;
	name: string;
	maker: string;
	year?: number;
	description: string;
	url: string;
	pictures: Picture[];
	favorite?: string;
}

export interface ComputerListProps {
	computers: Computer[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}