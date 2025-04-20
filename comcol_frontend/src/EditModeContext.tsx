import React, { createContext, useContext, useState } from 'react';

// Create a context for editMode
const EditModeContext = createContext({
	editMode: false,
	toggleEditMode: () => { },
	setEditMode: (value: boolean) => { },
});

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [editMode, setEditMode] = useState(false);

	const toggleEditMode = () => {
		setEditMode((prev) => {
			const newValue = !prev;
			console.log('[EditModeContext] toggleEditMode called. New value:', newValue);
			return newValue;
		});
	};

	const setEditModeWithLog = (value: boolean) => {
		console.log('[EditModeContext] setEditMode called. Value:', value);
		setEditMode(value);
	};

	return (
		<EditModeContext.Provider value={{ editMode, toggleEditMode, setEditMode: setEditModeWithLog }}>
			{children}
		</EditModeContext.Provider>
	);
};

export const useEditMode = () => useContext(EditModeContext);