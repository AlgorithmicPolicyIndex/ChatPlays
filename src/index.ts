import {app, dialog, BrowserWindow} from "electron";
import {getData} from "./JSON/db";
import path from "path";
import {OBS, ServiceManager, serviceNames, servicesTypes, Twitch, YouTube} from "./Services";
import * as fs from "node:fs";
import {ipcManager, TTS} from "./functions";
import {runTwitch, runYouTube} from './ChatService';
import {execSync} from "node:child_process";
function getPythonVersion(pythonCmd: string) {
	try {
		const versionOutput = execSync(`${pythonCmd} --version`, { encoding: 'utf-8' }).trim();
		const versionMatch = versionOutput.match(/(\d+)\.(\d+)\.(\d+)/);

		if (!versionMatch) return null;

		return {
			major: parseInt(versionMatch[1], 10),
			minor: parseInt(versionMatch[2], 10),
		};
	} catch (error) {
		console.error("Error getting Python version:", error);
		return null;
	}
}

function isVersionLessThan(version: {major: number, minor: number}, target: { major: number, minor: number }) {
	return version.major < target.major || version.minor < target.minor;
}

// * Electron
app.setAppUserModelId("ChatPlays");
app.whenReady().then(async () => {
	if (!await import("electron-squirrel-startup")) app.quit();
	const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
	const pythonVersion = getPythonVersion(pythonCmd);
	if (!pythonVersion) {
		dialog.showErrorBox("Missing Python", "Unable to get a Python version. Python may not be installed. You need version 3.13.2 or higher.");
		app.quit();
		return;
	}

	console.log(`Installed Python Version: ${pythonVersion.major}.${pythonVersion.minor}.X`);

	const targetVersion = { major: 3, minor: 13 };
	if (isVersionLessThan(pythonVersion, targetVersion)) {
		dialog.showErrorBox("Python Version Too Low", `Python 3.13.X or higher is required. Your version is ${pythonVersion.major}.${pythonVersion.minor}.X. Please update Python.`);
		app.quit();
		return;
	}

	try {
		const pyPack = execSync(`python -c "import importlib.util; print(True if importlib.util.find_spec('pydirectinput') else False)"`, { encoding: "utf8" }).trim();
		if (pyPack === "False")
			return new Error();
	} catch (e) {
		dialog.showErrorBox("pydirectinput", "Please verify you have 'pydirectinput' installed via pip.");
		app.quit();
		return;
	}
	
	const win = new BrowserWindow({
		title: "ChatPlays - Control Panel",
		width: 800,
		height: 850,
		frame: false,
		roundedCorners: false,
		show: false,
		maximizable: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "controlpanel.js"),
			contextIsolation: true
		}
	});
	win.loadFile(path.resolve(__dirname, "..", "frontend", "controlpanel.html"));
	win.on("ready-to-show", async () => {
		const extensions = [".ts", ".js"];
		const cmdPath = path.join(__dirname, "games");
		const cmdFiles = fs.readdirSync(cmdPath).filter(file => {
			return extensions.some(ex => file.endsWith(ex));
		});
		const pluginPath = path.join(__dirname, "..", "frontend", "plugins");
		const pluginFiles = fs.readdirSync(pluginPath).filter(file => {
			return extensions.some(ex => file.endsWith(ex));
		});
		
		win.webContents.send("inputs", await new TTS(1).listAudioDevices());
		win.webContents.send("gameList", cmdFiles.map((v) => {
			return {Path: path.join(cmdPath, v), Name: v};
		}));
		win.webContents.send("pluginsUpdated", pluginFiles);
		win.webContents.send("chatSettingsFM", await getData());
		win.show();
	});

	return new ipcManager(win);
});

export const services = new ServiceManager();
services.addService("Twitch", new Twitch());
services.addService("YouTube", new YouTube());
services.addService("OBS", new OBS());

app.on("window-all-closed", async () => {
	return app.quit();
});

const handlers: {
	[T in serviceNames]: (service: servicesTypes[T]) => Promise<void>;
} = {
	Twitch: runTwitch,
	YouTube: runYouTube,
	OBS: async () => {}
}
services.on("ServiceConnected", async function<T extends serviceNames>(name: T, service: servicesTypes[T])  {
	return await handlers[name](service);	
});