const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
	// App information
	getVersion: () => ipcRenderer.invoke('app:getVersion'),
	getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
	
	// File system operations
	showSaveDialog: () => ipcRenderer.invoke('app:showSaveDialog'),
	showOpenDialog: () => ipcRenderer.invoke('app:showOpenDialog'),
	writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
	readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
	
	// Navigation
	onNavigate: (callback) => ipcRenderer.on('navigate-to', callback),
	removeNavigateListener: (callback) => ipcRenderer.removeListener('navigate-to', callback),
	
	// Article operations
	onSaveArticle: (callback) => ipcRenderer.on('save-article', callback),
	removeSaveArticleListener: (callback) => ipcRenderer.removeListener('save-article', callback),
	
	// Export operations
	onExportData: (callback) => ipcRenderer.on('export-data', callback),
	removeExportDataListener: (callback) => ipcRenderer.removeListener('export-data', callback),
	
	// Notifications
	showNotification: (title, body) => ipcRenderer.send('notification:show', { title, body }),
	
	// Settings
	onSettingsUpdate: (settings) => ipcRenderer.send('settings:updated', settings),
	
	// Check if running in Electron
	isElectron: true
});

// Expose a limited set of Node.js APIs
contextBridge.exposeInMainWorld('nodeAPI', {
	platform: process.platform,
	arch: process.arch,
	versions: process.versions
});