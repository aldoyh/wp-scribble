const { app, BrowserWindow, Menu, shell, dialog, ipcMain, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Keep a global reference of the window object
let mainWindow;
let tray;
let backendProcess;

const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

async function loadDevServer() {
	const maxRetries = 30; // 30 seconds total
	let retries = 0;
	
	const tryLoad = async () => {
		try {
			await mainWindow.loadURL('http://localhost:8081');
		} catch (error) {
			retries++;
			if (retries < maxRetries) {
				// Show loading message
				await mainWindow.loadFile(path.join(__dirname, 'loading.html'));
				setTimeout(tryLoad, 1000); // Retry every second
			} else {
				// Show error page after max retries
				await mainWindow.loadFile(path.join(__dirname, 'error.html'));
			}
		}
	};
	
	await tryLoad();
}

function createWindow() {
	// Create the browser window
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js'),
		},
		titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
		icon: path.join(__dirname, 'assets', 'icon.png'),
		show: false, // Don't show until ready
	});

	// Load the app
	if (isDev) {
		// In development, try to load from dev server with retry logic
		loadDevServer();
	} else {
		mainWindow.loadFile('build/frontend/index.html');
	}

	// Show window when ready
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		
		// Focus on window
		if (isDev) {
			mainWindow.focus();
		}
	});

	// Handle external links
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: 'deny' };
	});

	// Handle window closed
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	// Handle window minimize to tray (optional)
	mainWindow.on('minimize', (event) => {
		if (process.platform === 'darwin') {
			// On macOS, minimize normally
			return;
		}
		
		// On other platforms, minimize to tray if enabled
		const settings = getAppSettings();
		if (settings.minimizeToTray) {
			event.preventDefault();
			mainWindow.hide();
			showTrayNotification('Scribbble is running in the background');
		}
	});

	// Handle window close
	mainWindow.on('close', (event) => {
		const settings = getAppSettings();
		if (settings.closeToTray && !app.isQuiting) {
			event.preventDefault();
			mainWindow.hide();
			showTrayNotification('Scribbble is running in the background');
		}
	});
}

function createTray() {
	// Create tray icon
	const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray-icon.png'));
	trayIcon.setTemplateImage(true);
	
	tray = new Tray(trayIcon);
	
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Show Scribbble',
			click: () => {
				if (mainWindow) {
					mainWindow.show();
					mainWindow.focus();
				}
			}
		},
		{
			label: 'New Article',
			accelerator: 'CmdOrCtrl+N',
			click: () => {
				if (mainWindow) {
					mainWindow.show();
					mainWindow.focus();
					mainWindow.webContents.send('navigate-to', '/new');
				}
			}
		},
		{ type: 'separator' },
		{
			label: 'Dashboard',
			click: () => {
				if (mainWindow) {
					mainWindow.show();
					mainWindow.focus();
					mainWindow.webContents.send('navigate-to', '/dashboard');
				}
			}
		},
		{
			label: 'Settings',
			click: () => {
				if (mainWindow) {
					mainWindow.show();
					mainWindow.focus();
					mainWindow.webContents.send('navigate-to', '/settings');
				}
			}
		},
		{ type: 'separator' },
		{
			label: 'Quit',
			accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
			click: () => {
				app.isQuiting = true;
				app.quit();
			}
		}
	]);
	
	tray.setContextMenu(contextMenu);
	tray.setToolTip('Scribbble - Blogging Platform');
	
	// Handle tray double-click
	tray.on('double-click', () => {
		if (mainWindow) {
			if (mainWindow.isVisible()) {
				mainWindow.hide();
			} else {
				mainWindow.show();
				mainWindow.focus();
			}
		}
	});
}

function createApplicationMenu() {
	const template = [
		{
			label: 'File',
			submenu: [
				{
					label: 'New Article',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('navigate-to', '/new');
						}
					}
				},
				{
					label: 'Save',
					accelerator: 'CmdOrCtrl+S',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('save-article');
						}
					}
				},
				{ type: 'separator' },
				{
					label: 'Export Data',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('export-data');
						}
					}
				},
				{ type: 'separator' },
				process.platform === 'darwin' 
					? { role: 'close' }
					: { role: 'quit' }
			]
		},
		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				{ role: 'selectall' }
			]
		},
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ role: 'forceReload' },
				{ role: 'toggleDevTools' },
				{ type: 'separator' },
				{ role: 'resetZoom' },
				{ role: 'zoomIn' },
				{ role: 'zoomOut' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' }
			]
		},
		{
			label: 'Go',
			submenu: [
				{
					label: 'Dashboard',
					accelerator: 'CmdOrCtrl+D',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('navigate-to', '/dashboard');
						}
					}
				},
				{
					label: 'Settings',
					accelerator: 'CmdOrCtrl+,',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('navigate-to', '/settings');
						}
					}
				}
			]
		},
		{
			label: 'Window',
			submenu: [
				{ role: 'minimize' },
				{ role: 'close' }
			]
		}
	];

	if (process.platform === 'darwin') {
		template.unshift({
			label: app.getName(),
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{
					label: 'Preferences...',
					accelerator: 'Cmd+,',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send('navigate-to', '/settings');
						}
					}
				},
				{ type: 'separator' },
				{ role: 'services', submenu: [] },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		});

		// Window menu
		template[5].submenu = [
			{ role: 'close' },
			{ role: 'minimize' },
			{ role: 'zoom' },
			{ type: 'separator' },
			{ role: 'front' }
		];
	}

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

function startBackend() {
	if (isDev) {
		// In development, assume backend is running separately
		return;
	}

	// In production, start the backend process
	const backendPath = path.join(process.resourcesPath, 'app', 'source', 'backend', 'index.mjs');
	
	backendProcess = spawn('node', [backendPath], {
		env: {
			...process.env,
			NODE_ENV: 'production',
			PORT: '4000'
		}
	});

	backendProcess.stdout.on('data', (data) => {
		console.log(`Backend: ${data}`);
	});

	backendProcess.stderr.on('data', (data) => {
		console.error(`Backend Error: ${data}`);
	});

	backendProcess.on('close', (code) => {
		console.log(`Backend process exited with code ${code}`);
	});
}

function stopBackend() {
	if (backendProcess) {
		backendProcess.kill();
		backendProcess = null;
	}
}

function getAppSettings() {
	// Get app settings from local storage or default values
	// This would integrate with the settings API we created
	return {
		minimizeToTray: true,
		closeToTray: false,
		notifications: true,
		autoUpdate: true
	};
}

function showTrayNotification(message) {
	if (tray && getAppSettings().notifications) {
		tray.displayBalloon({
			title: 'Scribbble',
			content: message,
			icon: path.join(__dirname, 'assets', 'icon.png')
		});
	}
}

// App event handlers
app.whenReady().then(() => {
	// Start backend server
	startBackend();
	
	// Create main window
	createWindow();
	
	// Create application menu
	createApplicationMenu();
	
	// Create system tray
	createTray();
	
	app.on('activate', () => {
		// On macOS, re-create window when dock icon is clicked
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		} else if (mainWindow) {
			mainWindow.show();
		}
	});
});

app.on('window-all-closed', () => {
	// On macOS, keep app running even when all windows are closed
	if (process.platform !== 'darwin') {
		stopBackend();
		app.quit();
	}
});

app.on('before-quit', () => {
	app.isQuiting = true;
	stopBackend();
});

// IPC handlers
ipcMain.handle('app:getVersion', () => {
	return app.getVersion();
});

ipcMain.handle('app:getPlatform', () => {
	return process.platform;
});

ipcMain.handle('app:showSaveDialog', async () => {
	const result = await dialog.showSaveDialog(mainWindow, {
		filters: [
			{ name: 'Markdown', extensions: ['md'] },
			{ name: 'HTML', extensions: ['html'] },
			{ name: 'All Files', extensions: ['*'] }
		]
	});
	return result;
});

ipcMain.handle('app:showOpenDialog', async () => {
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ['openFile'],
		filters: [
			{ name: 'Markdown', extensions: ['md'] },
			{ name: 'Text', extensions: ['txt'] },
			{ name: 'All Files', extensions: ['*'] }
		]
	});
	return result;
});

ipcMain.handle('fs:writeFile', async (event, filePath, content) => {
	try {
		fs.writeFileSync(filePath, content, 'utf8');
		return { success: true };
	} catch (error) {
		return { success: false, error: error.message };
	}
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
	try {
		const content = fs.readFileSync(filePath, 'utf8');
		return { success: true, content };
	} catch (error) {
		return { success: false, error: error.message };
	}
});

// Handle notifications
ipcMain.on('notification:show', (event, { title, body }) => {
	if (getAppSettings().notifications) {
		showTrayNotification(`${title}: ${body}`);
	}
});

// Handle app settings updates
ipcMain.on('settings:updated', (event, settings) => {
	// Handle settings changes that affect the main process
	if (settings.theme) {
		// Could update native theme here
	}
});