import React, { useState, useEffect } from 'react';
import { useData, Link, useNavigate } from 'react-sprout';
import { get, put, post } from '../utils/rest';
import Spinner from '../components/spinner';
import ProfileMenu from '../components/profile-menu';
import Scribbble from '../components/logo/scribbble';
import SettingsIcon from '../icons/settings';
import { useElectronFeatures } from '../hooks/use-electron-features.jsx';

export async function getSettingsData() {
	let promises = [get('/api/profile'), get('/api/settings')];
	let [user, settings] = await Promise.all(promises);
	return { user, settings };
}

export default function Settings() {
	let navigate = useNavigate();
	let { user: initialUser, settings: initialSettings } = useData();
	let [user] = useState(initialUser);
	let [settings, setSettings] = useState(initialSettings);
	let [loading, setLoading] = useState(false);
	let [saved, setSaved] = useState(false);
	let { isDesktop, updateSettings } = useElectronFeatures();


	useEffect(() => {
		document.title = 'Settings - Scribbble';
		document.body.classList.add('bg-gray-50');

		return () => {
			document.title = 'Scribbble';
			document.body.classList.remove('bg-gray-50');
		};
	}, []);

	async function handleSaveSetting(key, value) {
		try {
			setLoading(true);
			await put(`/api/settings/${key}`, { value });
			setSettings({ ...settings, [key]: value });
			
			// Notify Electron main process of settings change
			if (isDesktop) {
				updateSettings({ [key]: value });
			}
			
			showSavedMessage();
		} catch (error) {
			// Handle error silently for now
		} finally {
			setLoading(false);
		}
	}



	async function handleResetSettings() {
		if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
			try {
				setLoading(true);
				await post('/api/settings/reset');
				let newSettings = await get('/api/settings');
				setSettings(newSettings);
				showSavedMessage();
			} catch (error) {
				// Handle error silently for now
			} finally {
				setLoading(false);
			}
		}
	}

	function showSavedMessage() {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	async function handleLogoutClick() {
		let response = await fetch('/api/tokens', { method: 'DELETE' });
		if (response.ok) {
			document.cookie = 'id=; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			localStorage.removeItem('article');
			navigate('/');
		}
	}



	let renderAdminMenuLink;
	if (user.admin) {
		renderAdminMenuLink = (
			<a
				href={window.location.protocol + '//admin.' + window.location.host}
				className="block w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
				role="menuitem"
			>
				Admin dashboard
			</a>
		);
	}

	return (
		<div className="h-full px-6 overflow-auto font-sans bg-gray-50">
			<div className="max-w-4xl pt-6 mx-auto text-gray-700">
				<header className="flex items-center justify-between mb-6">
					<Link to="/dashboard" className="text-xl text-gray-700">
						<Scribbble />
					</Link>
					<div className="flex items-center space-x-4">
						{saved && (
							<span className="px-3 py-2 text-sm text-green-800 bg-green-100 rounded-md">
								Settings saved!
							</span>
						)}
						{loading && <Spinner className="w-5 h-5 text-blue-500" />}
						
						<ProfileMenu user={user}>
							<Link
								to="/dashboard"
								className="block w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
								role="menuitem"
							>
								Dashboard
							</Link>
							{renderAdminMenuLink}
							<button
								onClick={handleLogoutClick}
								className="w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
								role="menuitem"
							>
								Log out
							</button>
						</ProfileMenu>
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-4">
					{/* Settings Navigation */}
					<div className="lg:col-span-1">
						<nav className="bg-white rounded shadow">
							<div className="p-4 border-b border-gray-200">
								<h2 className="text-lg font-medium text-gray-900 flex items-center">
									<SettingsIcon className="w-5 h-5 mr-2" />
									Settings
								</h2>
							</div>
							<div className="p-2">
								<a href="#account" className="block px-3 py-2 rounded hover:bg-gray-100 text-sm">Account</a>
								<a href="#appearance" className="block px-3 py-2 rounded hover:bg-gray-100 text-sm">Appearance</a>
								<a href="#editor" className="block px-3 py-2 rounded hover:bg-gray-100 text-sm">Editor</a>
								<a href="#notifications" className="block px-3 py-2 rounded hover:bg-gray-100 text-sm">Notifications</a>
								{isDesktop && <a href="#desktop" className="block px-3 py-2 rounded hover:bg-gray-100 text-sm">Desktop App</a>}
								<a href="#privacy" className="block px-3 py-2 rounded hover:bg-gray-100 text-sm">Privacy</a>
								<a href="#advanced" className="block px-3 py-2 rounded hover:bg-gray-100 text-sm">Advanced</a>
							</div>
						</nav>
					</div>

					{/* Settings Content */}
					<div className="lg:col-span-3 space-y-6">
						{/* Account Settings */}
						<SettingsSection
							id="account"
							title="Account Settings"
							description="Manage your account information and security"
						>
							<SettingItem
								label="Username"
								description="Your unique username on Scribbble"
								value={user.username || 'Not set'}
								readonly
							/>
							<SettingItem
								label="Email"
								description="Your email address for notifications and login"
								value={user.email}
								readonly
							/>
							<SettingItem
								label="Display Name"
								description="Your display name shown on your profile"
								value={user.name || 'Not set'}
								readonly
							/>
							<div className="pt-4 border-t">
								<button
									onClick={handleResetSettings}
									className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 focus:outline-none focus:ring focus:ring-red-300 focus:ring-opacity-50"
								>
									Reset All Settings
								</button>
							</div>
						</SettingsSection>

						{/* Appearance Settings */}
						<SettingsSection
							id="appearance"
							title="Appearance"
							description="Customize how Scribbble looks and feels"
						>
							<SettingSelect
								label="Theme"
								description="Choose your preferred color theme"
								value={settings.theme || 'auto'}
								options={[
									{ value: 'light', label: 'Light' },
									{ value: 'dark', label: 'Dark' },
									{ value: 'auto', label: 'Auto (system)' }
								]}
								onChange={(value) => handleSaveSetting('theme', value)}
							/>
							<SettingSelect
								label="Font Size"
								description="Adjust the text size throughout the app"
								value={settings.fontSize || 'medium'}
								options={[
									{ value: 'small', label: 'Small' },
									{ value: 'medium', label: 'Medium' },
									{ value: 'large', label: 'Large' }
								]}
								onChange={(value) => handleSaveSetting('fontSize', value)}
							/>
							<SettingSelect
								label="Date Format"
								description="How dates are displayed"
								value={settings.dateFormat || 'relative'}
								options={[
									{ value: 'relative', label: 'Relative (2 days ago)' },
									{ value: 'absolute', label: 'Absolute (March 15, 2024)' },
									{ value: 'iso', label: 'ISO (2024-03-15)' }
								]}
								onChange={(value) => handleSaveSetting('dateFormat', value)}
							/>
						</SettingsSection>

						{/* Editor Settings */}
						<SettingsSection
							id="editor"
							title="Editor Preferences"
							description="Customize your writing experience"
						>
							<SettingSelect
								label="Editor Mode"
								description="Choose your preferred editing interface"
								value={settings.editorMode || 'wysiwyg'}
								options={[
									{ value: 'wysiwyg', label: 'WYSIWYG (Visual editor)' },
									{ value: 'markdown', label: 'Markdown' },
									{ value: 'split', label: 'Split view' }
								]}
								onChange={(value) => handleSaveSetting('editorMode', value)}
							/>
							<SettingToggle
								label="Auto Save"
								description="Automatically save your drafts while writing"
								checked={settings.autoSave === 'true' || settings.autoSave === true}
								onChange={(checked) => handleSaveSetting('autoSave', String(checked))}
							/>
							<SettingToggle
								label="Show Word Count"
								description="Display word count in the editor"
								checked={settings.showWordCount === 'true' || settings.showWordCount === true}
								onChange={(checked) => handleSaveSetting('showWordCount', String(checked))}
							/>
							<SettingToggle
								label="Spell Check"
								description="Enable spell checking in the editor"
								checked={settings.enableSpellCheck === 'true' || settings.enableSpellCheck === true}
								onChange={(checked) => handleSaveSetting('enableSpellCheck', String(checked))}
							/>
							<SettingSelect
								label="Default Article Visibility"
								description="Default visibility for new articles"
								value={settings.defaultArticleVisibility || 'public'}
								options={[
									{ value: 'public', label: 'Public' },
									{ value: 'private', label: 'Private' }
								]}
								onChange={(value) => handleSaveSetting('defaultArticleVisibility', value)}
							/>
						</SettingsSection>

						{/* Notification Settings */}
						<SettingsSection
							id="notifications"
							title="Notifications"
							description="Control when and how you receive notifications"
						>
							<SettingToggle
								label="Email Notifications"
								description="Receive notifications via email"
								checked={settings.emailNotifications === 'true' || settings.emailNotifications === true}
								onChange={(checked) => handleSaveSetting('emailNotifications', String(checked))}
							/>
							<SettingToggle
								label="Desktop Notifications"
								description="Show desktop notifications when the app is running"
								checked={settings.desktopNotifications === 'true' || settings.desktopNotifications === true}
								onChange={(checked) => handleSaveSetting('desktopNotifications', String(checked))}
							/>
							<SettingToggle
								label="Sound Notifications"
								description="Play sounds for notifications"
								checked={settings.soundNotifications === 'true' || settings.soundNotifications === true}
								onChange={(checked) => handleSaveSetting('soundNotifications', String(checked))}
							/>
						</SettingsSection>

						{/* Desktop Settings - Only show in Electron */}
						{isDesktop && (
							<SettingsSection
								id="desktop"
								title="Desktop App"
								description="Desktop-specific application settings"
							>
								<SettingToggle
									label="Minimize to System Tray"
									description="Hide the app to system tray when minimized"
									checked={settings.minimizeToTray === 'true' || settings.minimizeToTray === true}
									onChange={(checked) => handleSaveSetting('minimizeToTray', String(checked))}
								/>
								<SettingToggle
									label="Close to System Tray"
									description="Keep the app running in system tray when closed"
									checked={settings.closeToTray === 'true' || settings.closeToTray === true}
									onChange={(checked) => handleSaveSetting('closeToTray', String(checked))}
								/>
								<SettingToggle
									label="Start with System"
									description="Automatically start Scribbble when your computer boots"
									checked={settings.autoStart === 'true' || settings.autoStart === true}
									onChange={(checked) => handleSaveSetting('autoStart', String(checked))}
								/>
								<SettingToggle
									label="Auto Update"
									description="Automatically download and install updates"
									checked={settings.autoUpdate === 'true' || settings.autoUpdate === true}
									onChange={(checked) => handleSaveSetting('autoUpdate', String(checked))}
								/>
							</SettingsSection>
						)}

						{/* Privacy Settings */}
						<SettingsSection
							id="privacy"
							title="Privacy & Data"
							description="Control your privacy and data preferences"
						>
							<SettingSelect
								label="Export Format"
								description="Default format for exporting your data"
								value={settings.exportFormat || 'markdown'}
								options={[
									{ value: 'markdown', label: 'Markdown' },
									{ value: 'html', label: 'HTML' },
									{ value: 'pdf', label: 'PDF' }
								]}
								onChange={(value) => handleSaveSetting('exportFormat', value)}
							/>
							<div className="pt-4 border-t">
								<Link
									to="/export"
									className="inline-flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
								>
									Export Your Data
								</Link>
							</div>
						</SettingsSection>

						{/* Advanced Settings */}
						<SettingsSection
							id="advanced"
							title="Advanced"
							description="Advanced application settings"
						>
							<SettingSelect
								label="Language"
								description="Application interface language"
								value={settings.language || 'en'}
								options={[
									{ value: 'en', label: 'English' },
									{ value: 'es', label: 'Español' },
									{ value: 'fr', label: 'Français' },
									{ value: 'de', label: 'Deutsch' },
									{ value: 'it', label: 'Italiano' },
									{ value: 'pt', label: 'Português' },
									{ value: 'ru', label: 'Русский' },
									{ value: 'zh', label: '中文' },
									{ value: 'ja', label: '日本語' }
								]}
								onChange={(value) => handleSaveSetting('language', value)}
							/>
						</SettingsSection>
					</div>
				</div>
			</div>
		</div>
	);
}

function SettingsSection({ id, title, description, children }) {
	return (
		<section id={id} className="bg-white rounded shadow">
			<div className="p-6 border-b border-gray-200">
				<h3 className="text-lg font-medium text-gray-900">{title}</h3>
				{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
			</div>
			<div className="p-6 space-y-6">{children}</div>
		</section>
	);
}

function SettingItem({ label, description, value, readonly = false }) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex-1">
				<label className="block text-sm font-medium text-gray-900">{label}</label>
				{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
			</div>
			<div className="ml-4">
				<span className={`text-sm ${readonly ? 'text-gray-500' : 'text-gray-900'}`}>{value}</span>
			</div>
		</div>
	);
}

function SettingToggle({ label, description, checked, onChange }) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex-1">
				<label className="block text-sm font-medium text-gray-900">{label}</label>
				{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
			</div>
			<div className="ml-4">
				<button
					type="button"
					className={`${
						checked ? 'bg-blue-600' : 'bg-gray-200'
					} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
					onClick={() => onChange(!checked)}
				>
					<span
						className={`${
							checked ? 'translate-x-5' : 'translate-x-0'
						} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
					/>
				</button>
			</div>
		</div>
	);
}

function SettingSelect({ label, description, value, options, onChange }) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex-1">
				<label className="block text-sm font-medium text-gray-900">{label}</label>
				{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
			</div>
			<div className="ml-4">
				<select
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="block w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}