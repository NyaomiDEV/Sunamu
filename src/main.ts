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
	dbus.sessionBus().getProxyObject("org.freedesktop.DBus", "/org/freedesktop/DBus").then(async (dbusPO) => {
		const iface = await dbusPO.getInterface("org.freedesktop.DBus");

		iface.on("NameOwnerChanged", async (name, oldOwner, newOwner) => {
			if (name.match(/org\.mpris\.MediaPlayer2/) !== null) {
				if (oldOwner === "")
					await addPlayer(name);
				else if (newOwner === "")
					await deletePlayer(name);
			}
		});
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
	players[name].on("musicChanged", () => updateInfo());
	players[name].on("playbackStatusChanged", () => updateInfo());
	players[name].on("seeked", () => updateInfo());
}

function unregisterPlayerEvents(name: string){
	players[name].removeAllListeners("musicChanged");
	players[name].removeAllListeners("playbackStatusChanged");
	players[name].removeAllListeners("seeked");
}

async function calculateActivePlayer(preferred?: string){
	for(let name in players){
		if(await players[name].PlaybackStatus === "Playing"){
			registerPlayerEvents(name);
			activePlayer = name;
			break;
		}
	}

	if(!activePlayer && preferred){
		registerPlayerEvents(preferred);
		activePlayer = preferred;
	}

	for(let name in players){
		if (name !== activePlayer)
			unregisterPlayerEvents(name);
	}
}

async function updateInfo() {
	if(!activePlayer) return;

	let update: Update = {
		metadata: parseMetadata(await players[activePlayer].Metadata),
		status: await players[activePlayer].PlaybackStatus || "Stopped",
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
		artist: typeof metadata["xesam:artist"] === "string" ? metadata["xesam:artist"] : metadata["xesam:artist"].join("; "),
		album: metadata["xesam:album"],
		length: Number(metadata["mpris:length"]) / 1000000,
		artUrl: metadata["mpris:artUrl"]
	};
}

main();