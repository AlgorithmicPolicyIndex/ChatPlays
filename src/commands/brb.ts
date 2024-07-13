import { BrowserWindow } from "electron";

module.exports = {
	name: "brb",
	execute: async (_Args: string[], user: any, settings: any, window: BrowserWindow, _channel: string) => {
		if (
			user.toLowerCase() == settings.twitch.toLowerCase()
			|| user.id.toLowerCase() == settings.youtube.toLowerCase()
			&& settings.useChat
		) {
			return window.webContents.executeJavaScript(`(() => { brbHandler(); })();`);
		}
	}
}