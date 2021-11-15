import { app, BrowserWindow, ipcMain, shell } from "electron";
import { stat } from "fs/promises";
import { resolve } from "path";
import Player from "./player";
import { searchForUserToken } from "./integrations/mxmusertoken";
import { widgetMode, debugMode, checkFunctionality, debug } from "./util";
import { get as getLyrics, save as saveLyrics } from "./integrations/lyricsOffline";
import { getPresenceConfig, updatePresence } from "./integrations/discord-rpc";
import { get as getConfig, getAll as getAllConfig } from "./config";

process.title = "sunamu";

let win: BrowserWindow;

if(widgetMode)
	debug("Widget mode");

app.commandLine.appendSwitch("use-gl", "desktop");

if(process.env.WAYLAND_DISPLAY && process.env.XDG_SESSION_TYPE === "wayland" && checkFunctionality(getConfig("waylandOzone"), "wayland-ozone")){
	// We are in a Wayland session, most probably
	app.commandLine.appendSwitch("enable-features", "UseOzonePlatform");
	app.commandLine.appendSwitch("ozone-platform", "wayland");
}

async function main() {
	await Player.init(updateInfo);

	registerSunamuApi();

	await app.whenReady();
	await spawnWindow();
}

function registerSunamuApi(){
	ipcMain.on("previous", () => Player.Previous());
	ipcMain.on("playPause", () => Player.PlayPause());
	ipcMain.on("next", () => Player.Next());

	ipcMain.on("shuffle", () => Player.Shuffle());
	ipcMain.on("repeat", () => Player.Repeat());

	ipcMain.on("seek", (_e, perc) => Player.SeekPercentage(perc));
	ipcMain.handle("getPosition", async () => Player.GetPosition());

	ipcMain.handle("getLyrics", async (_e, id) => await getLyrics(id));
	ipcMain.handle("saveLyrics", async (_e, id, data) => await saveLyrics(id, data));

	ipcMain.handle("mxmusertoken", async () => await searchForUserToken());

	ipcMain.on("updateDiscordPresence", async (_e, presence) => updatePresence(presence));
	ipcMain.handle("getDiscordPresenceConfig", async () => await getPresenceConfig());

	ipcMain.on("requestUpdate", async () => await updateInfo());

	ipcMain.on("minimize", () => win.minimize());
	ipcMain.on("close", () => {
		win.close();
		app.exit();
	});

	ipcMain.on("openExternal", (_e, uri) => shell.openExternal(uri));
	ipcMain.handle("getConfig", () => getAllConfig());

	ipcMain.handle("shouldBullyGlasscordUser", async () => {
		let bullyGlasscordUser = false;
		const gcPath = resolve(app.getPath("appData"), "glasscord");

		try {
			await stat(gcPath);
			bullyGlasscordUser = true;
			await stat(resolve(gcPath, "DONTBULLYME"));
			bullyGlasscordUser = false;
		} catch (_) {
			//...
		}

		return bullyGlasscordUser;
	});

	ipcMain.handle("isWidgetMode", () => widgetMode);
	ipcMain.handle("isDebugMode", () => debugMode);
}

async function spawnWindow() {
	win = new BrowserWindow({
		show: true,
		frame: false,
		transparent: widgetMode,
		hasShadow: !widgetMode,
		minWidth: 458,
		minHeight: 512,
		backgroundColor: widgetMode ? "#00000000" : "#000000",
		maximizable: !widgetMode,
		minimizable: !widgetMode,
		resizable: true,
		fullscreenable: !widgetMode,
		skipTaskbar: widgetMode,
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: resolve(__dirname, "preload.js")
		},
		roundedCorners: true,
		icon: resolve(__dirname, "..", "assets", "icons", "512x512.png"),
		title: widgetMode ? "Sunamu Widget" : "Sunamu"
	});
	//if (process.env.DEBUG) win.webContents.openDevTools();
	win.loadFile(resolve(__dirname, "..", "www", "index.htm"));
}

async function updateInfo(){
	const update = await Player.getUpdate();
	if(update) {
		debug("update", update);
		win?.webContents?.send("update", update);
	} else {
		debug("update empty");
		win?.webContents?.send("update");
	}
}

main();