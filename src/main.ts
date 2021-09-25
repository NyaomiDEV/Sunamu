import { app, BrowserWindow, ipcMain } from "electron";
import { Player, PlayerFactory } from "mpris-for-dummies";
import dbus from "dbus-next";
import { resolve } from "path";
import { MPRIS2Player } from "mpris-for-dummies/lib/player";
import { Metadata, Update } from "./types";

const factory = new PlayerFactory();
let players: {[key: string]: Player & MPRIS2Player} = {};
let activePlayer: string | undefined;

let win: BrowserWindow;

async function main() {
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

	const names = await factory.getPlayerNames();
	for (let name of names)
		await addPlayer(name);

	ipcMain.on("playpause", () => {
		if(activePlayer) players[activePlayer]?.PlayPause?.();
	});

	ipcMain.on("next", () => {
		if(activePlayer) players[activePlayer]?.Next?.();
	});

	ipcMain.on("previous", () => {
		if(activePlayer) players[activePlayer]?.Previous?.();
	});

	ipcMain.on("minimize", () => win.minimize());

	ipcMain.on("close", () => {
		win.close();
		app.exit();
	});

	await app.whenReady();
	await spawnWindow();
}

async function addPlayer(name: string) {
	players[name] = await factory.getPlayer(name) as Player & MPRIS2Player;
	registerPlayerEvents(name);
	calculateActivePlayer(name);
	console.log("Added player", name);
}

async function deletePlayer(name: string) {
	players[name].dispose();
	delete players[name];
	calculateActivePlayer();
	console.log("Removed player", name);
}

function registerPlayerEvents(name: string){
	players[name].on("musicChanged", () => {
		if(name === activePlayer){
			updateInfo();
			return;
		}

		calculateActivePlayer(name);
	});
	players[name].on("playbackStatusChanged", (status: string) => {
		if(name === activePlayer){
			updateInfo();
			return;
		}

		if(status === "Playing") calculateActivePlayer(name);
	});
	players[name].on("seeked", () => {
		if(name === activePlayer){
			updateInfo();
			return;
		}

		calculateActivePlayer(name);
	});
}

async function calculateActivePlayer(preferred?: string){
	let _activePlayer;

	for(let name in players){
		if(await players[name].PlaybackStatus === "Playing"){
			_activePlayer = name;
			break;
		}
	}

	if(!_activePlayer && preferred)
		_activePlayer = preferred;

	if(!_activePlayer && Object.keys(players).length > 0)
		_activePlayer = Object.keys(players)[0];

	activePlayer = _activePlayer;
	updateInfo();
}

async function updateInfo() {
	if(!activePlayer){
		console.log("updateInfo empty");
		win.webContents.send("update");
		return;
	}

	let update: Update = {
		metadata: parseMetadata(await players[activePlayer].Metadata),
		capabilities: {
			canControl: await players[activePlayer].CanControl || false,
			canPlayPause: await players[activePlayer].CanPause || await players[activePlayer].CanPlay || false,
			canChangeTrack: await players[activePlayer].CanGoNext || await players[activePlayer].CanGoPrevious || false,
			hasSeekbar: await players[activePlayer].CanSeek || false
		},
		status: await players[activePlayer].PlaybackStatus || "Stopped",
		loop: await players[activePlayer].LoopStatus || "None",
		shuffle: await players[activePlayer].Shuffle || false,
		volume: await players[activePlayer].Volume || 0,
		elapsed: Number(await players[activePlayer].Position) / 1000000,
		app: activePlayer,
		appName: await players[activePlayer].app.Identity || ""
	};

	console.log("updateInfo", update);

	win.webContents.send("update", update);
}

async function spawnWindow() {
	win = new BrowserWindow({
		show: true,
		frame: false,
		minWidth: 854,
		minHeight: 480,
		backgroundColor: "#212121",
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: resolve(__dirname, "preload.js")
		},
		transparent: false,
		roundedCorners: true,
	});

	win.loadFile(resolve(__dirname, "..", "www", "index.htm"));
	//win.webContents.openDevTools();

	win.webContents.on("did-finish-load", async () => await updateInfo());
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

main();