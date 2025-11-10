import path from "path";
import fs from "node:fs";
import {BrowserWindow} from "electron";

export type PluginType = "application" | "chat" | "service" | "music"

export interface PluginInfo {
	author: string;
	name: string;
	fileName: string;
	description: string;
	type: PluginType;
	init: MutationObserver;
	Options?: {
		configurable: boolean;
	}
	pathName: string;
}

export class Plugins {
	private readonly pluginDir = path.resolve(__dirname, "..", "..", "plugins");

	async get(): Promise<PluginInfo[]> {
		const pluginsFiles = fs.readdirSync(this.pluginDir).filter(file => {
			return file.endsWith(".js");
		});

		// TODO: Sort enabled and disabled plugins
		return pluginsFiles.map((file) => {
			return require(path.join(this.pluginDir, file)).info;
		});
	}

	enable(info: PluginInfo, window: BrowserWindow) {
		if (!window) throw new Error(`Plugin not available. Please make sure the correct window is open.\n${info.type}`);

		window.webContents.send("loadPlugin", info);
	}
	disable(info: PluginInfo, window: BrowserWindow) {
		if (!window) throw new Error(`Plugin not available. Please make sure the correct window is open.\n${info.type}`);

		window.webContents.send("unloadPlugin", info);
	}
	// configure(info: PluginInfo) {
	//
	// }
}