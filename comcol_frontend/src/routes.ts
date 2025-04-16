// Centralized route paths for the application

const ROUTES = {
	HOME: '/',
	EDIT_COMPUTER: (id: string | number) => `/view/${id}`,
};

export default ROUTES;