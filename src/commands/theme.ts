import { BrowserWindow } from "electron";
import { create } from "../JSON/db";

module.exports = {
	name: "theme",
	execute: async (Args: string[], user: any, settings: any, window: BrowserWindow, channel: string) => {
		if (
			user.toLowerCase() == settings.twitch.toLowerCase()
			|| user == settings.youtube
			&& settings.useChat
		) {
			await create({ ActiveGame: "", SetGame: "", Voice: false, Theme: Args[0]}, true);
	
			return window.webContents.executeJavaScript(`(() => { changeCSS("${Args[0]}", "${channel}", "${settings.processTitle}"); })();`);
		}
	}
}