import { Config, JsonDB } from "node-json-db";

const db = new JsonDB(new Config("JSON/settings", true, true, "/"));

export async function create(Options: {ActiveGame: string, SetGame: string, Voice: boolean}, override?:boolean) {
	return await db.push("/settings", Options, override);
}

export async function exists() {
	return await db.exists("/settings");
}

export async function getData(type: "ActiveGame" | "SetGame" | "Voice") {
	return db.getData(`/settings/${type}`);
}