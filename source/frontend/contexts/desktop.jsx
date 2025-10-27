import React, { createContext, useContext, useState, useEffect } from 'react';

const DesktopContext = createContext();

export function DesktopProvider({ children }) {
	const [isDesktop, setIsDesktop] = useState(false);
	const [electronAPI, setElectronAPI] = useState(null);
	const [platform, setPlatform] = useState('web');

	useEffect(() => {
		// Check if running in Electron
		if (window.electronAPI) {
			setIsDesktop(true);
			setElectronAPI(window.electronAPI);
			
			// Get platform information
			window.electronAPI.getPlatform().then((platformInfo) => {
				setPlatform(platformInfo);
			});
		}
	}, []);

	const contextValue = {
		isDesktop,
		electronAPI,
		platform
	};

	return (
		<DesktopContext.Provider value={contextValue}>
			{children}
		</DesktopContext.Provider>
	);
}

export function useDesktop() {
	const context = useContext(DesktopContext);
	if (context === undefined) {
		throw new Error('useDesktop must be used within a DesktopProvider');
	}
	return context;
}