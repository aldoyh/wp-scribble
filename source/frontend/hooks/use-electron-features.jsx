import { useEffect, useCallback } from 'react';
import { useDesktop } from '../contexts/desktop.jsx';
import { useNavigate } from 'react-sprout';

export function useElectronFeatures() {
	const { isDesktop, electronAPI } = useDesktop();
	const navigate = useNavigate();

	// Handle navigation from main process
	useEffect(() => {
		if (!isDesktop || !electronAPI) return;

		const handleNavigate = (event, path) => {
			navigate(path);
		};

		electronAPI.onNavigate(handleNavigate);

		return () => {
			electronAPI.removeNavigateListener(handleNavigate);
		};
	}, [isDesktop, electronAPI, navigate]);

	// Handle save article shortcut
	useEffect(() => {
		if (!isDesktop || !electronAPI) return;

		const handleSaveArticle = () => {
			// Trigger save for current article if in editor
			const event = new CustomEvent('electron-save-article');
			window.dispatchEvent(event);
		};

		electronAPI.onSaveArticle(handleSaveArticle);

		return () => {
			electronAPI.removeSaveArticleListener(handleSaveArticle);
		};
	}, [isDesktop, electronAPI]);

	// Handle export data
	useEffect(() => {
		if (!isDesktop || !electronAPI) return;

		const handleExportData = () => {
			// Navigate to export or trigger export
			navigate('/export');
		};

		electronAPI.onExportData(handleExportData);

		return () => {
			electronAPI.removeExportDataListener(handleExportData);
		};
	}, [isDesktop, electronAPI, navigate]);

	// Utility functions for desktop features
	const showNotification = useCallback((title, body) => {
		if (isDesktop && electronAPI) {
			electronAPI.showNotification(title, body);
		} else {
			// Fallback to browser notification
			if (Notification.permission === 'granted') {
				new Notification(title, { body });
			}
		}
	}, [isDesktop, electronAPI]);

	const saveFile = useCallback(async (content, filename) => {
		if (!isDesktop || !electronAPI) return null;

		try {
			const result = await electronAPI.showSaveDialog();
			if (!result.canceled && result.filePath) {
				const writeResult = await electronAPI.writeFile(result.filePath, content);
				if (writeResult.success) {
					showNotification('File Saved', `Successfully saved ${filename}`);
					return result.filePath;
				} else {
					showNotification('Save Failed', writeResult.error);
					return null;
				}
			}
		} catch (error) {
			showNotification('Save Failed', error.message);
			return null;
		}
		return null;
	}, [isDesktop, electronAPI, showNotification]);

	const openFile = useCallback(async () => {
		if (!isDesktop || !electronAPI) return null;

		try {
			const result = await electronAPI.showOpenDialog();
			if (!result.canceled && result.filePaths.length > 0) {
				const readResult = await electronAPI.readFile(result.filePaths[0]);
				if (readResult.success) {
					return {
						path: result.filePaths[0],
						content: readResult.content
					};
				} else {
					showNotification('Open Failed', readResult.error);
					return null;
				}
			}
		} catch (error) {
			showNotification('Open Failed', error.message);
			return null;
		}
		return null;
	}, [isDesktop, electronAPI, showNotification]);

	const updateSettings = useCallback((settings) => {
		if (isDesktop && electronAPI) {
			electronAPI.onSettingsUpdate(settings);
		}
	}, [isDesktop, electronAPI]);

	return {
		isDesktop,
		showNotification,
		saveFile,
		openFile,
		updateSettings
	};
}