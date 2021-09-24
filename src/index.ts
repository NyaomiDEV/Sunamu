import { app, BrowserWindow, ipcMain } from "electron";
import { PlayerFactory } from "mpris-for-dummies";
import dbus from "dbus-next";
import { resolve } from "path";

const factory = new PlayerFactory();
let players = {};

let win: BrowserWindow;

// todo, store info for each app and provide now playing accurately
let currentInfo = {
	metadata: {
		artist: "",
		title: "",
		album: "",
		artUrl: "",
		length: 0
	},
	status: "Stopped",
	elapsed: 0,
	app: "",
	appName: "No app is running"
};

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
		players[currentInfo.app]?.PlayPause();
	});

	ipcMain.on("next", () => {
		players[currentInfo.app]?.Next();
	});

	ipcMain.on("previous", () => {
		players[currentInfo.app]?.Previous();
	});

	ipcMain.on("minimize", () => win.minimize());

	ipcMain.on("close", () => {
		win.close();
		app.exit();
	});

	await app.whenReady();
	await spawnWindow();
}

async function addPlayer(name) {
	players[name] = await factory.getPlayer(name);

	players[name].on("musicChanged", async (info: any) => {
		currentInfo.metadata = parseMetadata(info);
		currentInfo.elapsed = Number(await players[name].Position) / 1000000;
		currentInfo.app = name;
		currentInfo.appName = await players[name].app.Identity;
		await updateInfo();
	});

	players[name].on("playbackStatusChanged", async (info: string) => {
		currentInfo.status = info;
		currentInfo.elapsed = Number(await players[name].Position) / 1000000;
		currentInfo.app = name;
		currentInfo.appName = await players[name].app.Identity;
		await updateInfo();
	});

	players[name].on("seeked", async (seekTo: number) => {
		currentInfo.elapsed = seekTo;
		await updateInfo();
	});

	currentInfo.status = await players[name].PlaybackStatus;
	currentInfo.metadata = parseMetadata(await players[name].Metadata);
	currentInfo.elapsed = Number(await players[name].Position) / 1000000;
	currentInfo.app = name;
	currentInfo.appName = await players[name].app.Identity;

	console.log("Added player", name);
}

async function deletePlayer(name) {
	players[name].dispose();
	delete players[name];
	console.log("Removed player", name);
}

async function updateInfo() {
	console.log("updateInfo", currentInfo);

	win.webContents.send("update", currentInfo);
}

async function spawnWindow() {
	win = new BrowserWindow({
		show: true,
		frame: false,
		width: 800,
		height: 600,
		backgroundColor: "#212121",
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: resolve(__dirname, "shit", "preload.js")
		},
		transparent: false,
		roundedCorners: true,
	});

	win.loadFile(resolve(__dirname, "shit", "index.htm"));
	//win.webContents.openDevTools();

	win.webContents.on("did-finish-load", async () => await updateInfo());
}

function parseMetadata(metadata){
	return {
		title: metadata["xesam:title"],
		artist: typeof metadata["xesam:artist"] === "string" ? metadata["xesam:artist"] : metadata["xesam:artist"].join("; "),
		album: metadata["xesam:album"],
		length: Number(metadata["mpris:length"]) / 1000000,
		artUrl: metadata["mpris:artUrl"]
	};
}

main();