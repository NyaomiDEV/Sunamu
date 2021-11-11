import songdata from "../songdata.js";

async function getPresence() {
	if (!songdata || !songdata.metadata.id)
		return;

	const now = Date.now();
	const start = Math.round(now - (songdata.elapsed * 1000));
	const end = Math.round(start + (songdata.metadata.length * 1000));

	/** @type {import("discord-rpc").Presence} */
	const activity = {
		details: songdata.metadata.artist,
		state: songdata.metadata.title,
		largeImageKey: "app_large",
		largeImageText: songdata.metadata.album,
		smallImageKey: songdata.status.toLowerCase(),
		smallImageText: songdata.status,
		instance: false
	};

	if (songdata.status === "Playing") {
		activity.startTimestamp = start;
		activity.endTimestamp = end;
	}

	return activity;
}

export async function updateDiscordPresence(){
	return window.np.updateDiscordPresence(await getPresence());
}