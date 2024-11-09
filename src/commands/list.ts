import { BrowserWindow } from "electron";
import { Chat } from "../functions";

const name = "list";

async function execute(_Args: string[], _user: any, settings: any, window: BrowserWindow, _channel: string) {
	const plugins = await window.webContents.executeJavaScript(`
	(() => {
		return {
			disabledPlugins: plugins,
			enabledPlugins: enabledPlugins
		};
	})();`);

	const { disabledPlugins, enabledPlugins } = plugins;
	const message = `Enabled Plugins:<br>${enabledPlugins.join(", ")}<br><br>Disabled Plugins:<br>${disabledPlugins.join(", ")}`
	console.log(message.replace(/<br>/g, "\n"));
	await Chat("TWITCH", {"display-name": "ChatPlays"}, message, settings, window);
}

export {
	name,
	execute
}