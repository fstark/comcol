import { useState, useEffect } from 'react';
import { fetchComputers } from './api';
import { Computer } from './types'; // Importing the Computer type

const useFetchComputer = (id: string) => {
	const [computer, setComputer] = useState<Computer | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadComputer = async () => {
			const computers = await fetchComputers();
			if (isMounted) {
				const selectedComputer = computers.find((comp: Computer) => comp.id === parseInt(id || '0', 10));
				setComputer(selectedComputer || null);
			}
		};
		loadComputer();

		return () => {
			isMounted = false;
		};
	}, [id]);

	return { computer, setComputer };
};

export default useFetchComputer;