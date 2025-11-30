import path from "path";
import fs from "node:fs";
import {BrowserWindow} from "electron";

export type PluginType = "application" | "chat" | "music" | "external";

export interface PluginInfo {
	author: string;
	name: string;
	dirName: string;
	description: string;
	type: PluginType;
	init: () => any;
	options?: {
		configurable?: boolean;
	}
}

export class Plugins {
	private readonly pluginDir = path.resolve(__dirname, "..", "..", "plugins");

	async get(): Promise<PluginInfo[]> {
		return (await Promise.all(
			fs.readdirSync(this.pluginDir, { withFileTypes: true })
				.filter(d => d.isDirectory())
				.map(d => {
					const plugin = require(path.join(this.pluginDir, d.name, "index.js")).info;
					return isPluginInfo(plugin) ? plugin : null;
				})
		)).filter(Boolean) as PluginInfo[];
	}

	enable(info: PluginInfo, window?: BrowserWindow) {
		if (!window) return;

		window!.webContents.send("loadPlugin", info);
	}
	disable(info: PluginInfo, window?: BrowserWindow) {
		if (!window) return;

		window!.webContents.send("unloadPlugin", info);
	}
	// configure(info: PluginInfo) {
	//
	// }
}

function isPluginInfo(obj: any): obj is PluginInfo {
	const template: Partial<Record<keyof PluginInfo, true>> = {
		author: true,
		name: true,
		dirName: true,
		description: true,
		type: true,
		init: true,
		options: true,
	};

	for (const key in template) {
		if (!(key in obj)) return false;

		if (key === "init" && typeof obj.init !== "function") return false;
	}

	return !(obj.Options && typeof obj.Options.configurable !== "boolean" && obj.Options.configurable !== undefined);
}
