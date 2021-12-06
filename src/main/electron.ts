import { app, BrowserWindow, ipcMain, shell } from "electron";
import { stat } from "fs/promises";
import { resolve } from "path";
import getPlayer, { Player } from "./player";
import { searchForUserToken } from "./integrations/mxmusertoken";
import { get as getLyrics, save as saveLyrics } from "./integrations/lyricsOffline";
import { getPresenceConfig, updatePresence } from "./integrations/discord-rpc";
import { getAll as getAllConfig } from "./config";
import { widgetMode, debugMode, waylandOzone } from "./appStatus";
import windowStateKeeper from "electron-window-state";
import { io } from "./webserver";
import { addCallback, updateInfo } from "./eventDispatcher";
import { getAppData } from "./util";

process.title = "sunamu";

let win: BrowserWindow;
let player: Player;

if (process.platform === "linux") {
	app.commandLine.appendSwitch("use-gl", "desktop");
	if (process.env.WAYLAND_DISPLAY && process.env.XDG_SESSION_TYPE === "wayland" && waylandOzone) {
		// We are in a Wayland session, most probably
		app.commandLine.appendSwitch("enable-features", "UseOzonePlatform");
		app.commandLine.appendSwitch("ozone-platform", "wayland");
	}
}

function registerElectronIpc() {
	ipcMain.on("previous", () => player.Previous());
	ipcMain.on("playPause", () => player.PlayPause());
	ipcMain.on("next", () => player.Next());

	ipcMain.on("shuffle", () => player.Shuffle());
	ipcMain.on("repeat", () => player.Repeat());

	ipcMain.on("seek", (_e, perc) => player.SeekPercentage(perc));
	ipcMain.handle("getPosition", async () => player.GetPosition());

	ipcMain.handle("getLyrics", async (_e, id) => await getLyrics(id));
	ipcMain.handle("saveLyrics", async (_e, id, data) => {
		const result = await saveLyrics(id, data);
		if (result)
			io.emit("refreshLyrics");
		return result;
	});

	ipcMain.handle("mxmusertoken", async () => await searchForUserToken());

	ipcMain.on("updateDiscordPresence", async (_e, presence) => updatePresence(presence));
	ipcMain.handle("getDiscordPresenceConfig", async () => await getPresenceConfig());

	ipcMain.on("requestUpdate", async () => await updateInfo());

	ipcMain.handle("getConfig", () => getAllConfig());

	ipcMain.handle("shouldBullyGlasscordUser", async () => {
		let bullyGlasscordUser = false;
		const gcPath = resolve(getAppData(), "glasscord");

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

	ipcMain.on("minimize", () => win.minimize());
	ipcMain.on("close", () => {
		win.close();
		app.exit();
	});

	ipcMain.on("openExternal", (_e, uri) => shell.openExternal(uri));

	addCallback(update => win.webContents.send("update", update));
}

async function spawnWindow() {
	const mainWindowState = windowStateKeeper({
		defaultWidth: 458,
		defaultHeight: 512
	});

	win = new BrowserWindow({
		show: false,
		frame: false,
		transparent: widgetMode,
		hasShadow: !widgetMode,
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
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
	mainWindowState.manage(win);
	if (debugMode) win.webContents.openDevTools();

	win.loadFile(resolve(__dirname, "..", "www", "index.htm"));
	win.once("ready-to-show", () => win.show());
}

export default async function electronMain() {
	player = await getPlayer();

	registerElectronIpc();

	await app.whenReady();
	await spawnWindow();
}