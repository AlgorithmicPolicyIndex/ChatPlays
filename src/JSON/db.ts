import { Config, JsonDB } from "node-json-db";

const db = new JsonDB(new Config("JSON/settings", true, true, "/"));

export async function updateData(data: any) {
	if (!await db.exists("/")) {
		await db.push("/", {
			"chatWidth": "650",
			"chatHeight": "959",
			"theme": "default",
			"maxblobs": "10",
			"maxhistory": "5",
			"otherEmotes": false,
			"popupEvents": false,
			"monitor": "0",
			"popupW": "400",
			"popupH": "112",
			"enableChat": true,
			"name": "",
			"brb": false,
			"gamePath": "D:\\Coding_Projects\\ChatPlays\\out\\ChatPlays-win32-x64\\resources\\app.asar\\build\\games\\Destiny2.js",
			"playsChance": "1",
			"playtime": "30",
			"Plugins": {
				"Enabled": [],
				"Disabled": []
			},
			"twitchID": "",
			"userId": "",
			"youtubeID": "",
			"OBSPort": "",
			"OBSPASS": "",
			"audio": "none",
			"voiceKey": "L",
			"voiceChance": "1"
		});
		return await db.getData("/");
	}
	return await db.push("/", data, true);
}


export async function getData() {
	return db.getData(`/`);
}