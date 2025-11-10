import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig.js";
import {PluginInfo} from "../functions/plugins";

const db = new JsonDB(new Config("JSON/settings", true, true, "/"));

type Settings = {
	"brb": boolean,
	"chatWidth": string,
	"chatHeight": string,
	"theme": string,
	"maxblobs": string,
	"maxhistory": string,
	"otherEmotes": boolean,
	"popupEvents": boolean,
	"monitor": string,
	"popupW": string,
	"popupH": string,
	"enableChat": boolean,
	"name": string,
	"gamePath": string,
	"playsChance": string,
	"playtime": string,
	"Plugins": {
		"Enabled": PluginInfo[],
	},
	"twitchID": string,
	"userId": string | undefined,
	"youtubeID": string,
	"OBSPort": string,
	"OBSPASS": string,
	"audio": string,
	"voiceKey": string,
	"voiceChance": string,
	"usePython": boolean,
	"ChatPlaysActive": boolean,
}

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
				"Enabled": []
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


export async function getData(): Promise<Settings> {
	const data: Settings = await db.getData("/");
	await updateData(data);
	return data;
}