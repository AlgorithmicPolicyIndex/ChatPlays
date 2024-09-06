import { BrowserWindow } from "electron";

module.exports = {
	name: "testsub",
	execute: async (_Args: string[], user: any, settings: any, window: BrowserWindow, _channel: string) => {
		if (
			user.toLowerCase() == settings.twitch.toLowerCase()
			|| user == settings.youtube
			&& settings.useChat
		) {
			return window.webContents.executeJavaScript(`(() => { subscription("ThisIsALongTestName"); })();`);
		}
	}
}