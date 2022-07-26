import { app, BrowserWindow, ipcMain, shell } from "electron";
import { resolve } from "path";
import getPlayer, { Player } from "./player";
import { getAll as getAllConfig } from "./config";
import { widgetModeElectron, debugMode, waylandOzone } from "./appStatus";
import windowStateKeeper from "electron-window-state";
import { addLyricsUpdateCallback, addPositionCallback, addSongDataCallback, deleteLyricsUpdateCallback, deletePositionCallback, deleteSongDataCallback, songdata } from "./playbackStatus";
import { getThemeLocation } from "./themes";

process.title = "sunamu";

const openedBrowserWindows: Map<BrowserWindow, string> = new Map();
let player: Player;

// Enable GPU rasterization so it's smooth asf
app.commandLine.appendSwitch("enable-gpu-rasterization");

if (process.platform === "linux") {
	if (process.env.WAYLAND_DISPLAY && process.env.XDG_SESSION_TYPE === "wayland" && waylandOzone) {
		// We are in a Wayland session, most probably
		app.commandLine.appendSwitch("enable-features", "UseOzonePlatform");
		app.commandLine.appendSwitch("ozone-platform", "wayland");
	}
}

function getIcon() {
	let icoName = "512x512.png";
	switch (process.platform) {
		case "win32":
			icoName = "icon.ico";
			break;
		default:
			break;
	}
	return resolve(__dirname, "..", "..", "assets", "icons", icoName);
}

function registerElectronIpc() {
	ipcMain.on("previous", () => player.Previous());
	ipcMain.on("playPause", () => player.PlayPause());
	ipcMain.on("next", () => player.Next());

	ipcMain.on("shuffle", () => player.Shuffle());
	ipcMain.on("repeat", () => player.Repeat());

	ipcMain.on("seek", (_e, perc) => player.SeekPercentage(perc));
	ipcMain.handle("getPosition", async () => await player.GetPosition());
	ipcMain.on("setPosition", (_e, position) => player.SetPosition(position));

	ipcMain.handle("getSongData", () => songdata);
	ipcMain.handle("getConfig", () => getAllConfig());

	ipcMain.handle("isWidgetMode", (e) => {
		const _win = BrowserWindow.fromWebContents(e.sender);

		if(!_win)
			return false; // without browserwindow we return false, always

		const scene = openedBrowserWindows.get(_win);
		return isWidgetModeForScene(scene);
	});

	ipcMain.handle("isDebugMode", () => debugMode);

	ipcMain.handle("getScene", (e) => {
		const _win = BrowserWindow.fromWebContents(e.sender);
		if(_win)
			return openedBrowserWindows.get(_win);
		return undefined;
	});

	ipcMain.handle("getThemeLocationFor", (_e, theme) => getThemeLocation(theme));

	ipcMain.on("minimize", (e) => {
		const _win = BrowserWindow.fromWebContents(e.sender);
		if(_win) _win.minimize();
	});

	ipcMain.on("close", (e) => {
		const _win = BrowserWindow.fromWebContents(e.sender);
		if (_win) _win.close();
		
		if(!BrowserWindow.getAllWindows().length)
			app.exit();
	});

	ipcMain.on("openExternal", (_e, uri) => shell.openExternal(uri));
}

function isWidgetModeForScene(scene){
	if (!scene || scene === "electron")
		return widgetModeElectron; // assume default scene if scene is not there

	return getAllConfig().scenes[scene].widgetMode;
}

function registerWindowCallbacks(win: BrowserWindow){
	const positionCallback = async (position, reportsPosition) => win.webContents.send("position", position, reportsPosition);
	const songDataCallback = async (songdata, metadataChanged) => win.webContents.send("update", songdata, metadataChanged);
	const lyricsUpdateCallback = async () => win.webContents.send("refreshLyrics");

	addPositionCallback(positionCallback);
	addSongDataCallback(songDataCallback);
	addLyricsUpdateCallback(lyricsUpdateCallback);

	win.on("close", () => {
		deletePositionCallback(positionCallback);
		deleteSongDataCallback(songDataCallback);
		deleteLyricsUpdateCallback(lyricsUpdateCallback);
	});
}

async function spawnWindow(scene = "electron") {
	const windowState = windowStateKeeper({
		defaultWidth: 458,
		defaultHeight: 512,
		file: `window-state-${scene}.json`
	});

	const win = new BrowserWindow({
		show: false,
		frame: false,
		transparent: isWidgetModeForScene(scene),
		hasShadow: !isWidgetModeForScene(scene),
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
		minWidth: 458,
		minHeight: 512,
		backgroundColor: isWidgetModeForScene(scene) ? "#00000000" : "#000000",
		maximizable: !isWidgetModeForScene(scene),
		minimizable: !isWidgetModeForScene(scene),
		resizable: true,
		fullscreenable: !isWidgetModeForScene(scene),
		skipTaskbar: isWidgetModeForScene(scene),
		focusable: !(process.platform === "win32" && isWidgetModeForScene(scene)),
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: resolve(__dirname, "..", "www", "lib", "npapi", "electron-npapi.js")
		},
		roundedCorners: true,
		icon: getIcon(),
		title: (isWidgetModeForScene(scene) ? "Sunamu Widget" : "Sunamu") + (scene !== "electron" ? `[${scene}]` : "")
	});
	windowState.manage(win);

	if (debugMode) win.webContents.openDevTools();

	win.loadFile(resolve(__dirname, "..", "www", "index.htm"));
	win.once("ready-to-show", async () => {
		win.show();
		if (process.platform === "win32") {
			const win32platform = await import("./platform/win32");
			if(isWidgetModeForScene(scene)) win32platform.sendOnBottom(win);
		}
	});

	registerWindowCallbacks(win);
	return win;
}

export default async function electronMain() {
	player = await getPlayer();
	registerElectronIpc();

	await app.whenReady();
	for(const scene in getAllConfig().scenes){
		if (getAllConfig().scenes[scene].type === "electron")
			openedBrowserWindows.set(await spawnWindow(scene), scene);
	}
}