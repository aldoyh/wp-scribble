import Router from 'express-promise-router';
import { BadRequestError, NotFoundError } from '../errors/http.mjs';
import db from '../database.mjs';

let settingsRouter = Router({ strict: true });

// Get user settings
settingsRouter.get('/api/settings', async function (request, response) {
	let user = request.user;
	let settings = await db.all('SELECT key, value FROM settings WHERE userId = ?', user.id);
	
	// Convert array of settings to object
	let settingsObj = {};
	for (let setting of settings) {
		try {
			// Try to parse JSON values
			settingsObj[setting.key] = JSON.parse(setting.value);
		} catch (error) {
			// If not JSON, store as string
			settingsObj[setting.key] = setting.value;
		}
	}
	
	response.json(settingsObj);
});

// Get specific setting
settingsRouter.get('/api/settings/:key', async function (request, response) {
	let user = request.user;
	let key = request.params.key;
	
	let setting = await db.get('SELECT value FROM settings WHERE userId = ? AND key = ?', user.id, key);
	if (!setting) {
		throw new NotFoundError(`Setting ${key} not found`);
	}
	
	try {
		response.json({ [key]: JSON.parse(setting.value) });
	} catch (error) {
		response.json({ [key]: setting.value });
	}
});

// Update or create setting
settingsRouter.put('/api/settings/:key', async function (request, response) {
	let user = request.user;
	let key = request.params.key;
	let { value } = request.body;
	
	if (value === undefined) {
		throw new BadRequestError('Setting value is required');
	}
	
	// Validate setting keys and values
	const allowedSettings = {
		theme: ['light', 'dark', 'auto'],
		notifications: ['true', 'false'],
		autoSave: ['true', 'false'],
		fontSize: ['small', 'medium', 'large'],
		editorMode: ['wysiwyg', 'markdown', 'split'],
		exportFormat: ['markdown', 'html', 'pdf'],
		language: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'],
		dateFormat: ['relative', 'absolute', 'iso'],
		showWordCount: ['true', 'false'],
		enableSpellCheck: ['true', 'false'],
		defaultArticleVisibility: ['public', 'private'],
		emailNotifications: ['true', 'false'],
		desktopNotifications: ['true', 'false'],
		soundNotifications: ['true', 'false']
	};
	
	if (allowedSettings[key] && !allowedSettings[key].includes(String(value))) {
		throw new BadRequestError(`Invalid value for setting ${key}. Allowed values: ${allowedSettings[key].join(', ')}`);
	}
	
	let now = Date.now();
	let valueStr = typeof value === 'string' ? value : JSON.stringify(value);
	
	// Use UPSERT (INSERT OR REPLACE) to update or create setting
	await db.run(
		`INSERT OR REPLACE INTO settings (userId, key, value, updatedAt) VALUES (?, ?, ?, ?)`,
		user.id,
		key,
		valueStr,
		now
	);
	
	// Update user's last settings update timestamp
	await db.run('UPDATE users SET lastSettingsUpdate = ? WHERE id = ?', now, user.id);
	
	response.json({ [key]: value });
});

// Update multiple settings at once
settingsRouter.patch('/api/settings', async function (request, response) {
	let user = request.user;
	let settings = request.body;
	
	if (!settings || typeof settings !== 'object') {
		throw new BadRequestError('Settings object is required');
	}
	
	let now = Date.now();
	let updatedSettings = {};
	
	// Update each setting
	for (let [key, value] of Object.entries(settings)) {
		let valueStr = typeof value === 'string' ? value : JSON.stringify(value);
		
		await db.run(
			`INSERT OR REPLACE INTO settings (userId, key, value, updatedAt) VALUES (?, ?, ?, ?)`,
			user.id,
			key,
			valueStr,
			now
		);
		
		updatedSettings[key] = value;
	}
	
	// Update user's last settings update timestamp
	await db.run('UPDATE users SET lastSettingsUpdate = ? WHERE id = ?', now, user.id);
	
	response.json(updatedSettings);
});

// Delete setting
settingsRouter.delete('/api/settings/:key', async function (request, response) {
	let user = request.user;
	let key = request.params.key;
	
	let result = await db.run('DELETE FROM settings WHERE userId = ? AND key = ?', user.id, key);
	
	if (result.changes === 0) {
		throw new NotFoundError(`Setting ${key} not found`);
	}
	
	response.json({ message: `Setting ${key} deleted` });
});

// Reset settings to defaults
settingsRouter.post('/api/settings/reset', async function (request, response) {
	let user = request.user;
	let now = Date.now();
	
	// Delete all user settings
	await db.run('DELETE FROM settings WHERE userId = ?', user.id);
	
	// Insert default settings
	const defaultSettings = [
		['theme', 'auto'],
		['notifications', 'true'],
		['autoSave', 'true'],
		['fontSize', 'medium'],
		['editorMode', 'wysiwyg'],
		['exportFormat', 'markdown'],
		['language', 'en'],
		['dateFormat', 'relative'],
		['showWordCount', 'true'],
		['enableSpellCheck', 'true'],
		['defaultArticleVisibility', 'public'],
		['emailNotifications', 'true'],
		['desktopNotifications', 'true'],
		['soundNotifications', 'false']
	];
	
	for (let [key, value] of defaultSettings) {
		await db.run(
			`INSERT INTO settings (userId, key, value, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
			user.id,
			key,
			value,
			now,
			now
		);
	}
	
	// Update user's last settings update timestamp
	await db.run('UPDATE users SET lastSettingsUpdate = ? WHERE id = ?', now, user.id);
	
	response.json({ message: 'Settings reset to defaults' });
});

export default settingsRouter;