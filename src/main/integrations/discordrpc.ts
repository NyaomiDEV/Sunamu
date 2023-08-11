import { Client, SetActivity } from "@xhayper/discord-rpc";
import { DiscordPresenceConfig } from "../../types";
import { debug } from "../";
import { checkFunctionality } from "../appStatus";
import { addConfigChangedCallback, get as getConfig } from "../config";
import { songdata } from "../playbackStatus";
import { secondsToTime } from "../util";

export let discordPresenceConfig: DiscordPresenceConfig = getPresenceConfig();

const clientId = "908012408008736779";
let rpc = new Client({clientId});

rpc.on("connected", () => {
	debug("Discord RPC is connected");
});

rpc.on("disconnected", async () => {
	debug("Discord RPC was disconnected");
});

addConfigChangedCallback(async () => {
	discordPresenceConfig = getPresenceConfig();
});

function getPresenceConfig() {
	const settings: DiscordPresenceConfig = Object.assign({}, getConfig<DiscordPresenceConfig>("discordRpc"));
	settings.enabled = checkFunctionality(settings.enabled, "discord-rpc");
	return settings;
}

const connect = (() => {
	let isConnecting = false;

	async function _connect(){
		if (rpc.isConnected) return;
		if (isConnecting) return;
		isConnecting = true;

		let error: boolean;
		do {
			error = false;
			try {
				debug("Discord RPC logging in");
				await rpc.connect();
			} catch (_e) {
				debug(_e);
				error = true;
				debug("Discord RPC errored out while logging in, waiting 5 seconds before retrying");
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		} while (error);
		isConnecting = false;
	}

	return _connect;
})();

export async function updatePresence() {
	if (!discordPresenceConfig.enabled){
		if(rpc.isConnected) rpc.destroy();
		return;
	}

	const presence = await getPresence();

	await connect();
	if (!rpc.isConnected) return; // failed

	if(!presence) {
		rpc.user?.clearActivity();
		return;
	}

	return rpc.user?.setActivity(presence);
}

async function getPresence() {
	if (!songdata || !songdata.metadata.id || discordPresenceConfig.blacklist.includes(songdata.appName))
		return;

	const activity: SetActivity = { // everything must be two characters long at least
		details: songdata.metadata.title ? `"${songdata.metadata.title}"` : "Unknown track",
		state: songdata.metadata.artist ? `By ${songdata.metadata.artist}` : undefined,
		largeImageText: songdata.metadata.album ? `"${songdata.metadata.album}"` : undefined,
		smallImageKey: songdata.status.toLowerCase(),
		smallImageText: `${songdata.status}` + (songdata.metadata.length > 0 ? ` (${secondsToTime(songdata.metadata.length)})` : ""),
		instance: false
	};

	if (songdata.status === "Playing" && songdata.elapsed.howMuch) {
		const now = Date.now();
		const start = Math.round(now - (songdata.elapsed.howMuch * 1000));
		const end = Math.round(start + (songdata.metadata.length * 1000));
		activity.startTimestamp = start;
		activity.endTimestamp = end;
	}

	if (songdata.spotify) {
		if (!activity.largeImageKey){
			const images = songdata.spotify.album?.images;
			if(images?.length)
				activity.largeImageKey = images[images?.length-1]?.url;
		}

		activity.buttons = [
			{
				label: "Listen on Spotify",
				url: songdata.spotify.external_urls.spotify
			}
		];
	}

	if (songdata.lastfm) {
		if(!activity.largeImageKey){
			const images = songdata.lastfm.album?.image;
			if (images?.length)
				activity.largeImageKey = images[images?.length - 1]?.["#text"];
		}

		activity.buttons = [
			{
				label: "View on Last.fm",
				url: songdata.lastfm.url
			}
		];
	}

	if (!activity.largeImageKey)
		activity.largeImageKey = "app_large";

	return activity;
}
