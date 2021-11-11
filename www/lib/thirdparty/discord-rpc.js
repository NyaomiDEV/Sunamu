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
		instance: false,
		buttons: []
	};

	if (songdata.status === "Playing") {
		activity.startTimestamp = start;
		activity.endTimestamp = end;
	}

	if (songdata.spotiUrl){
		activity.buttons.push({
			label: "Listen on Spotify",
			url: songdata.spotiUrl
		});
	}

	if (songdata.lastfm) {
		activity.buttons.push({
			label: "View on Last.fm",
			url: songdata.lastfm.url
		});
	}

	if(!activity.buttons.length)
		delete activity.buttons;

	return activity;
}

export async function updateDiscordPresence(){
	return window.np.updateDiscordPresence(await getPresence());
}
