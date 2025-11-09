import path from "path";
import fs from "node:fs";
import {BrowserWindow} from "electron";

export type PluginType = "application" | "chat" | "service" | "music"

export interface PluginInfo {
	author: string;
	name: string;
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
		return pluginsFiles.map((file) => {
			const plugin = require(path.join(this.pluginDir, file)).info;
			plugin.pathName = file;
			return plugin;
		});
	}

	enable(info: PluginInfo, window: BrowserWindow) {
		console.log(info, window);
	}
	// disable(info: PluginInfo) {
	//
	// }
	// configure(info: PluginInfo) {
	//
	// }
}