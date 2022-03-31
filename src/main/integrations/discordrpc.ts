import RPC, { Client, Presence } from "discord-rpc";
import { DiscordPresenceConfig } from "../../types";
import { debug } from "../";
import { checkFunctionality } from "../appStatus";
import { get as getConfig } from "../config";
import { songdata } from "../playbackStatus";
import { secondsToTime } from "../util";

const clientId = "908012408008736779";
let rpc: Client | undefined;
let loginPromise: Promise<unknown> | undefined;

const config: DiscordPresenceConfig = getPresenceConfig();

function getPresenceConfig() {
	const settings: DiscordPresenceConfig = Object.assign({}, getConfig("discordRpc"));
	settings.enabled = checkFunctionality(settings.enabled, "discord-rpc");
	return settings;
}

async function connect(){
	if(loginPromise) return loginPromise;

	let _resolve;
	loginPromise = new Promise(resolve => {_resolve = resolve;});
	let error: boolean, client: Client;

	do {
		client = new RPC.Client({
			transport: "ipc"
		});

		client.once("connected", () => {
			debug("Discord RPC is connected");
		});

		// @ts-ignore
		client.once("disconnected", async () => {
			debug("Discord RPC was disconnected");
			rpc = undefined;
		});

		try{
			error = false;
			debug("Discord RPC logging in");
			await client.connect(clientId);
		}catch(_e){
			debug(_e);
			error = true;
			client.removeAllListeners();
			await client.destroy().catch(() => {});
			debug("Discord RPC errored out while logging in, waiting 5 seconds before retrying");
			await new Promise(resolve => setTimeout(resolve, 5000));
		}
	}while(error);

	rpc = client;
	_resolve();
	loginPromise = undefined;
}

export async function updatePresence() {
	if (!config.enabled) return;

	const presence = await getPresence();

	while (!rpc)
		await connect();

	if(!presence) {
		rpc.clearActivity();
		return;
	}

	return rpc.setActivity(presence);
}

async function getPresence() {
	if (!songdata || !songdata.metadata.id || config.blacklist.includes(songdata.appName))
		return;

	const now = Date.now();
	const start = Math.round(now - (songdata.elapsed * 1000));
	const end = Math.round(start + (songdata.metadata.length * 1000));

	const activity: Presence = { // everything must be two characters long at least
		details: `"${songdata.metadata.title}"`,
		state: `By ${songdata.metadata.artist}`,
		largeImageKey: undefined,
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

	if (songdata.spotify) {
		if (!activity.largeImageKey){
			const images = songdata.spotify.album?.images;
			if(images && images.length)
				activity.largeImageKey = images[images?.length-1]?.url;
		}

		activity.buttons!.push({
			label: "Listen on Spotify",
			url: songdata.spotify.external_urls.spotify
		});
	}

	if (songdata.lastfm) {
		if(!activity.largeImageKey){
			const images = songdata.lastfm.album.image;
			if (images && images.length)
				activity.largeImageKey = images[images?.length - 1]?.["#text"];
		}

		activity.buttons!.push({
			label: "View on Last.fm",
			url: songdata.lastfm.url
		});
	}

	if (!activity.largeImageKey)
		activity.largeImageKey = "app_large";

	if (!activity.buttons!.length)
		delete activity.buttons;

	return activity;
}
