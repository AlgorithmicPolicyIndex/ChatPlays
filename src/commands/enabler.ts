import { BrowserWindow } from "electron";
import { Chat } from "../functions";
import { writeFileSync } from "fs";
import path from "path";

const name = "plugin";

async function execute(Args: string[], _user: any, settings: any, window: BrowserWindow, _channel: string) {
	const plugins = await window.webContents.executeJavaScript(`
	(() => {
		return {
			disabledPlugins: plugins,
			enabledPlugins
		}
	})();`);

	const { disabledPlugins, enabledPlugins } = plugins;

	const findplugin = (pluginArray: string[]) => { return pluginArray.filter((plugin) => new RegExp(plugin, "i").test(Args[0])) };
	const disabled = findplugin(disabledPlugins);
	const enabled = findplugin(enabledPlugins);


	if (disabled[0]) {
		window.webContents.executeJavaScript(`(() => {
			enabledPlugins.push("${disabled[0]}");
			plugins.splice(plugins.indexof("${disabled[0]}"), 1);
			loadPlugins();
		})();`);
		
		await Chat("Application", {"display-name": "ChatPlays", "badges": {"broadcaster": 1}}, `Plugin: ${disabled[0]} has been enabled.`, settings, window);
	} else if (enabled[0]) {
		window.webContents.executeJavaScript(`(() => {
			plugins.push("${enabled[0]}");
			enabledPlugins.splice(enabledPlugins.indexOf("${enabled[0]}"), 1);
			unloadPlugin("${enabled[0]}");
		})();`);
		await Chat("Application", {"display-name": "ChatPlays", "badges": {"broadcaster": 1}}, `Plugin: ${enabled[0]} has been disabled.`, settings, window);
	}

	const { disabledData, enabledData } = await window.webContents.executeJavaScript(`(() => { return { disabledData: plugins, enabledData: enabledPlugins } })();`);

	settings["enabledPlugins"] = enabledData.filter((v: string) => v != "");
	settings["disabledPlugins"] = disabledData.filter((v: string) => v != "");

	// updates the default settings.json
	writeFileSync(path.join(__dirname, "..", "..", "src", "settings.json"), JSON.stringify(settings, null, 8));
	// updates the Build version of the settings.json
	writeFileSync(path.join(__dirname, "..", "settings.json"), JSON.stringify(settings, null, 8));
}

export {
	name,
	execute
}