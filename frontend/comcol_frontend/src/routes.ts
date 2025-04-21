// Centralized route paths for the application

const ROUTES = {
	HOME: '/',
	EDIT_COMPUTER: (id: string | number) => `/view/${id}`,
	GAME: '/game', // Add route for the Game page
};

export default ROUTES;