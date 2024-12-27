import {BrowserWindow} from "electron";
import {newPopup} from "../functions";
import {services} from "../index";
import {OBSWebSocket} from "obs-websocket-js";

let count = 1;
module.exports = {
	name: "testsub",
	execute: async (Args: string[], user: any, settings: any, window: BrowserWindow, _channel: string) => {
		if (
			user.toLowerCase() == settings.twitch.toLowerCase()
			|| user == settings.youtube
			&& settings.useChat
		) {
			if (settings.usePopupEvents) {
				await newPopup(services.GetClient("OBS") as OBSWebSocket, `Popup - ${count}`, Args[0], settings, Args[1] ? Args[1] : "");
				return count++;
			}

			return window.webContents.executeJavaScript(`(() => { subscription("${Args[0]}"${Args[1] ? `, "${Args[1]}"` : ""}); })();`);
		}
	}
}