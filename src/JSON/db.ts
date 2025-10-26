import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig.js";

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
			"gamePath": "",
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
	const data = await db.getData("/");
	if (data.ChatPlaysActive) data.ChatPlaysActive = false;
	await updateData(data);
	return data;
}