import { debug } from "./util";
import { getPlayer, getPlayerNames } from "mpris-for-dummies";
import dbus from "dbus-next";
import { Metadata, Update } from "./types";
import MediaPlayer2 from "mpris-for-dummies/lib/MediaPlayer2";

let players: { [key: string]: MediaPlayer2 } = {};
let activePlayer: string | undefined;
let updateCallback: Function;

export async function init(callback: Function): Promise<void>{
	updateCallback = callback;
	const proxy = await dbus.sessionBus().getProxyObject("org.freedesktop.DBus", "/org/freedesktop/DBus");
	const iface = proxy.getInterface("org.freedesktop.DBus");

	iface.on("NameOwnerChanged", async (name, oldOwner, newOwner) => {
		if (name.match(/org\.mpris\.MediaPlayer2/) !== null) {
			if (oldOwner === "")
				await addPlayer(name);
			else if (newOwner === "")
				await deletePlayer(name);
		}
	});

	const names = await getPlayerNames();
	for (let name of names)
		await addPlayer(name);
}

export async function getUpdate(): Promise<Update | null> {
	if (!activePlayer) {
		debug("updateInfo empty");
		return null;
	}

	let update: Update = {
		provider: "MPRIS2",
		metadata: parseMetadata(players[activePlayer].Player.Metadata),
		capabilities: {
			canControl: players[activePlayer].Player.CanControl || false,
			canPlayPause: players[activePlayer].Player.CanPause || players[activePlayer].Player.CanPlay || false,
			canChangeTrack: players[activePlayer].Player.CanGoNext || players[activePlayer].Player.CanGoPrevious || false,
			hasSeekbar: players[activePlayer].Player.CanSeek || false
		},
		status: players[activePlayer].Player.PlaybackStatus || "Stopped",
		loop: players[activePlayer].Player.LoopStatus || "None",
		shuffle: players[activePlayer].Player.Shuffle || false,
		volume: players[activePlayer].Player.Volume || 0,
		elapsed: Number(await players[activePlayer].Player.GetPosition()) / 1000000,
		app: activePlayer,
		appName: players[activePlayer].Identity || ""
	};

	debug("updateInfo", update);
	return update;
}

export async function Play() {
	if (activePlayer) players[activePlayer]?.Player?.Play?.();
}

export async function Pause() {
	if (activePlayer) players[activePlayer]?.Player?.Pause?.();
}

export async function PlayPause(){
	if (activePlayer) players[activePlayer]?.Player?.PlayPause?.();
}

export async function Stop(){
	if (activePlayer) players[activePlayer]?.Player?.Stop?.();
}

export async function Next() {
	if (activePlayer) players[activePlayer]?.Player?.Next?.();
}

export async function Previous() {
	if (activePlayer) players[activePlayer]?.Player?.Previous?.();
}

export async function Shuffle() {
	if (activePlayer) {
		if (players[activePlayer]?.Player?.Shuffle)
			players[activePlayer].Player.Shuffle = false;
		else
			players[activePlayer].Player.Shuffle = true;
	}
}

export async function Repeat() {
	if (activePlayer) {
		switch(players[activePlayer]?.Player?.LoopStatus){
			case "None":
			default:
				players[activePlayer].Player.LoopStatus = "Track";
				break;
			case "Track":
				players[activePlayer].Player.LoopStatus = "Playlist";
				break;
			case "Playlist":
				players[activePlayer].Player.LoopStatus = "None";
				break;
		}
	}
}

export async function Seek(offset: number) {
	if (activePlayer) players[activePlayer]?.Player?.Seek?.(offset);
}

export async function SeekPercentage(percentage: number) {
	if (activePlayer) {
		await players[activePlayer]?.Player?.SetPosition(
			players[activePlayer]?.Player?.Metadata?.["mpris:trackid"],
			// eslint-disable-next-line no-undef
			BigInt(Math.floor(Number(players[activePlayer]?.Player?.Metadata?.["mpris:length"]) * percentage))
		);
		//updateCallback();
	}
}

// UTILS
async function addPlayer(name: string) {
	players[name] = await getPlayer(name);
	//await players[name].whenReady();
	registerPlayerEvents(name);
	await calculateActivePlayer(name);
	debug("Added player", name);
}

async function deletePlayer(name: string) {
	players[name];
	delete players[name];
	await calculateActivePlayer();
	debug("Removed player", name);
}

function registerPlayerEvents(name: string) {
	players[name].Player.on("PropertiesChanged", (changed) => {
		if (name === activePlayer) {
			debug("changed", changed);
			updateCallback();
			return;
		}

		if (changed.Metadata || changed.PlaybackStatus === "Playing")
			calculateActivePlayer(name);
	});

	players[name].Player.on("Seeked", async (to) => {
		if (name === activePlayer) {
			debug("seeked", to);
			await new Promise(resolve => setTimeout(resolve, 250)); // wait for new metadata to get populated by media player
			updateCallback();
			return;
		}

		calculateActivePlayer(name);
	});
}

async function calculateActivePlayer(preferred?: string) {
	let _activePlayer;

	for (let name in players) {
		if (players[name].Player.PlaybackStatus === "Playing") {
			_activePlayer = name;
			break;
		}
	}

	if (!_activePlayer && preferred)
		_activePlayer = preferred;

	if (!_activePlayer && Object.keys(players).length > 0)
		_activePlayer = Object.keys(players)[0];

	activePlayer = _activePlayer;
	updateCallback();
}

function parseMetadata(metadata): Metadata {
	return {
		title: metadata["xesam:title"],
		artist: typeof metadata["xesam:artist"] === "string" ? metadata["xesam:artist"] : metadata["xesam:artist"]?.join("; "),
		album: metadata["xesam:album"],
		length: Number(metadata["mpris:length"] || 0) / 1000000,
		artUrl: metadata["mpris:artUrl"]
	};
}
