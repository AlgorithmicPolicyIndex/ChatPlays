import { Config, JsonDB } from "node-json-db";

const db = new JsonDB(new Config("JSON/settings", true, true, "/"));

export async function updateData(data: any) {
	if (!await db.exists("/")) {
		await db.push("/", data);
		return await db.getData("/");
	}
	return await db.push("/", data, true);
}


export async function getData() {
	return db.getData(`/`);
}