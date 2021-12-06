import type { Presence } from "discord-rpc";
import type { DiscordPresenceConfig } from "../../types";
import { getPresenceConfig, updatePresence } from "../integrations/discordrpc";

import { songdata } from "../playbackStatus";
import { secondsToTime } from "../util";

const config: DiscordPresenceConfig = getPresenceConfig();

async function getPresence() {
	if (!songdata || !songdata.metadata.id || config.blacklist.includes(songdata.appName))
		return;

	const now = Date.now();
	const start = Math.round(now - (songdata.elapsed * 1000));
	const end = Math.round(start + (songdata.metadata.length * 1000));

	const activity: Presence = { // everything must be two characters long at least
		details: `"${songdata.metadata.title}"`,
		state: `By ${songdata.metadata.artist}`,
		largeImageKey: "app_large",
		largeImageText: `"${songdata.metadata.album}"`,
		smallImageKey: songdata.status.toLowerCase(),
		smallImageText: `${songdata.status} (${secondsToTime(songdata.metadata.length)})`,
		instance: false,
		buttons: []
	};

	if (songdata.status === "Playing") {
		activity.startTimestamp = start;
		activity.endTimestamp = end;
	}

	if (songdata.spotiUrl){
		activity.buttons!.push({
			label: "Listen on Spotify",
			url: songdata.spotiUrl
		});
	}

	if (songdata.lastfm) {
		activity.buttons!.push({
			label: "View on Last.fm",
			url: songdata.lastfm.url
		});
	}

	if(!activity.buttons!.length)
		delete activity.buttons;

	return activity;
}

export async function updateDiscordPresence(){
	if(!config.enabled) return;

	return updatePresence(await getPresence());
}
