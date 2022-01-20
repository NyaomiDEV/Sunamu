import { app, BrowserWindow, ipcMain, shell } from "electron";
import { stat } from "fs/promises";
import { resolve } from "path";
import getPlayer, { Player } from "./player";
import { getAll as getAllConfig } from "./config";
import { widgetModeElectron, debugMode, waylandOzone } from "./appStatus";
import windowStateKeeper from "electron-window-state";
import { addLyricsUpdateCallback, addPositionCallback, addSongDataCallback, songdata } from "./playbackStatus";
import { getAppData } from "./util";

process.title = "sunamu";

let win: BrowserWindow;
let player: Player;

// Enable GPU rasterization so it's smooth asf
app.commandLine.appendSwitch("--enable-gpu-rasterization");

if (process.platform === "linux") {
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

	ipcMain.handle("getSongData", async () => songdata);
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

	addPositionCallback(async (position, reportsPosition) => win.webContents.send("position", position, reportsPosition));
	addSongDataCallback(async (songdata, metadataChanged) => win.webContents.send("update", songdata, metadataChanged));
	addLyricsUpdateCallback(async () => win.webContents.send("refreshLyrics"));
}

function getIcon(){
	let icoName = "512x512.png";
	switch(process.platform){
		case "win32":
			icoName = "icon.ico";
			break;
		default:
			break;
	}
	return resolve(__dirname, "..", "..", "assets", "icons", icoName);
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
		focusable: !(process.platform === "win32" && widgetModeElectron),
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: resolve(__dirname, "..", "www", "lib", "npapi", "electron-npapi.js")
		},
		roundedCorners: true,
		icon: getIcon(),
		title: widgetModeElectron ? "Sunamu Widget" : "Sunamu"
	});
	mainWindowState.manage(win);

	if (debugMode) win.webContents.openDevTools();

	win.loadFile(resolve(__dirname, "..", "www", "index.htm"));
	win.once("ready-to-show", async () => {
		win.show();
		if (process.platform === "win32") {
			const win32platform = await import("./platform/win32");
			if(widgetModeElectron) win32platform.sendOnBottom(win);
		}
	});
}

export default async function electronMain() {
	player = await getPlayer();

	registerElectronIpc();

	await app.whenReady();
	await spawnWindow();
}