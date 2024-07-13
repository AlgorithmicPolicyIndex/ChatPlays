import { BrowserWindow } from "electron";
import { create } from "../JSON/db";

module.exports = {
	name: "theme",
	execute: async (Args: string[], user: any, settings: any, window: BrowserWindow, channel: string) => {
		if (
			user["display-name"].toLowerCase() == settings.twitch.toLowerCase()
			|| user.id.toLowerCase() == settings.youtube.toLowerCase()
			&& settings.useChat
		) {
			await create({ ActiveGame: "", SetGame: "" }, true);
	
			return window.webContents.executeJavaScript(`(() => { changeCSS("${Args[0]}", "${channel}"); })();`);
		}
	}
}