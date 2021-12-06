import { app, BrowserWindow, ipcMain, shell } from "electron";
import { stat } from "fs/promises";
import { resolve } from "path";
import getPlayer, { Player } from "./player";
import { getAll as getAllConfig } from "./config";
import { widgetModeElectron, debugMode, waylandOzone } from "./appStatus";
import windowStateKeeper from "electron-window-state";
import { addLyricsUpdateCallback, addUpdateCallback, updateInfo, sendSongData } from "./playbackStatus";
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

	ipcMain.on("requestUpdate", async () => await updateInfo());
	ipcMain.on("requestSongData", async () => await sendSongData(false));

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

	ipcMain.handle("isWidgetMode", () => widgetModeElectron);
	ipcMain.handle("isDebugMode", () => debugMode);

	ipcMain.on("minimize", () => win.minimize());
	ipcMain.on("close", () => {
		win.close();
		app.exit();
	});

	ipcMain.on("openExternal", (_e, uri) => shell.openExternal(uri));

	addUpdateCallback(async (songdata, metadataChanged) => win.webContents.send("update", songdata, metadataChanged));
	addLyricsUpdateCallback(async () => win.webContents.send("refreshLyrics"));
}

async function spawnWindow() {
	const mainWindowState = windowStateKeeper({
		defaultWidth: 458,
		defaultHeight: 512
	});

	win = new BrowserWindow({
		show: false,
		frame: false,
		transparent: widgetModeElectron,
		hasShadow: !widgetModeElectron,
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		minWidth: 458,
		minHeight: 512,
		backgroundColor: widgetModeElectron ? "#00000000" : "#000000",
		maximizable: !widgetModeElectron,
		minimizable: !widgetModeElectron,
		resizable: true,
		fullscreenable: !widgetModeElectron,
		skipTaskbar: widgetModeElectron,
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: resolve(__dirname, "preload.js")
		},
		roundedCorners: true,
		icon: resolve(__dirname, "..", "assets", "icons", "512x512.png"),
		title: widgetModeElectron ? "Sunamu Widget" : "Sunamu"
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