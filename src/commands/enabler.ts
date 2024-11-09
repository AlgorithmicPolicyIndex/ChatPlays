import { BrowserWindow } from "electron";
import { Chat } from "../functions";

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
			plugins.splice("${disabled[0]}", 1);
			loadPlugins();
		})();`);
		
		return await Chat("Application", {"display-name": "ChatPlays", "badges": {"broadcaster": 1}}, `Plugin: ${disabled[0]} has been enabled.`, settings, window);
	} else if (enabled[0]) {
		window.webContents.executeJavaScript(`(() => {
			plugins.push("${enabled[0]}");
			enabledPlugins.splice("${enabled[0]}", 1);
			unloadPlugin("${enabled[0]}");
		})();`);
		return await Chat("Application", {"display-name": "ChatPlays", "badges": {"broadcaster": 1}}, `Plugin: ${enabled[0]} has been disabled.`, settings, window);
	}
}

export {
	name,
	execute
}