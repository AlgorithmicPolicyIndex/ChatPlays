import dbus, {ProxyObject, sessionBus, Variant } from "dbus-next";

export interface NowPlaying {
	Author: string;
	Title: string,
	Position: ["LIVE"] | [number, number],
	Thumbnail?: string;
	audioURL?: string;
}
type PlaybackStatus = "Playing" | "Paused" | "Stopped";

// Linux Music
async function listNames(bus: dbus.MessageBus): Promise<string[]> {
	const obj = await bus.getProxyObject("org.freedesktop.DBus", "/org/freedesktop/DBus");
	const iface = obj.getInterface("org.freedesktop.DBus") as any;
	return await iface.ListNames(); // PascalCase, not camelCase
}

async function getProps(bus: dbus.MessageBus, name: string) {
	const obj: ProxyObject = await bus.getProxyObject(name, "/org/mpris/MediaPlayer2");
	return obj.getInterface("org.freedesktop.DBus.Properties") as any;
}

export async function musicRequest(): Promise<NowPlaying | "np"> {
	const uid = process.getuid?.() ?? Number(process.env.UID || 1000);
	const runtime = process.env.XDG_RUNTIME_DIR || `run/user/${uid}`;
	const addr = `unix:path=${runtime}/bus`;
	process.env.DBUS_SESSION_BUS_ADDRESS = addr;
	const bus = sessionBus();
	
	const names = await listNames(bus);
	const players = names.filter(n => n.startsWith("org.mpris.MediaPlayer2."));
	
	// Prefer firefox if present, else first player
	const firefox = players.find(n => /^org\.mpris\.MediaPlayer2\.firefox\./.test(n));
	const chosen = firefox || players[0];
	if (!chosen) {
		return "np";
	}
	
	const props = await getProps(bus, chosen);
	
	const statusVar: Variant = await props.Get("org.mpris.MediaPlayer2.Player", "PlaybackStatus");
	const status = statusVar.value as PlaybackStatus;
	
	const mdVar: Variant = await props.Get("org.mpris.MediaPlayer2.Player", "Metadata");
	const md = mdVar.value as Record<string, unknown>;
	
	const title = (md["xesam:title"] as Variant).value || "";
	const artistArr = (md["xesam:artist"] as Variant);
	const artist = artistArr.value[0] || "";
	
	if (status !== "Playing") {
		return "np";
	}
	
	const lengthUs = Number((md["mpris:length"] as Variant).value || 0);
	const posVar: Variant = await props.Get("org.mpris.MediaPlayer2.Player", "Position");
	const posUs = Number(posVar.value || 0);
	const usToMs = (us: number) => Math.floor(us / 1000);
	
	const out: any = {
		Author: artist,
		Title: title,
		Position: lengthUs > 0 ? [usToMs(posUs), usToMs(lengthUs)] : ["LIVE"]
	};
	
	const artUrl = ((md["mpris:artUrl"] as Variant).value as string) || "";
	if (artUrl) out.Thumbnail = artUrl;
	
	return out;
}