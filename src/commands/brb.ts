import { BrowserWindow } from "electron";

module.exports = {
	name: "brb",
	execute: async (_Args: string[], user: any, settings: any, window: BrowserWindow, _channel: string) => {
		if (
			settings.platform.toLowerCase() == "twitch"
				? user.toLowerCase() == settings.twitch.toLowerCase()
			: user.id == settings.youtube
			&& settings.useChat
		) {
			return window.webContents.executeJavaScript(`(() => { brbHandler(); })();`);
		}
	}
}