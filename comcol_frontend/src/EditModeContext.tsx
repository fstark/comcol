import React, { createContext, useContext, useState } from 'react';

// Create a context for editMode
const EditModeContext = createContext({
	editMode: false,
	toggleEditMode: () => { },
});

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [editMode, setEditMode] = useState(false);

	const toggleEditMode = () => {
		setEditMode((prev) => !prev);
	};

	return (
		<EditModeContext.Provider value={{ editMode, toggleEditMode }}>
			{children}
		</EditModeContext.Provider>
	);
};

export const useEditMode = () => useContext(EditModeContext);