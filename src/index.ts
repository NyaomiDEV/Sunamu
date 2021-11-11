import { app, BrowserWindow, ipcMain, shell } from "electron";
import { stat } from "fs/promises";
import { resolve } from "path";
import Player from "./player";
import { searchForUserToken } from "./integrations/mxmusertoken";
import { checkSwitch, debug, getConfig } from "./util";
import { get as getLyrics, save as saveLyrics } from "./integrations/lyricsOffline";
import { updatePresence } from "./integrations/discord-rpc";

process.title = "sunamu";

const widgetMode = checkSwitch(process.env.ILOVEGLASS);

let win: BrowserWindow;

if(widgetMode)
	debug("Widget mode");

app.commandLine.appendSwitch("use-gl", "desktop");

if(process.env.WAYLAND_DISPLAY && process.env.XDG_SESSION_TYPE === "wayland" && !process.env.NOWAYLAND){
	// We are in a Wayland session, most probably
	app.commandLine.appendSwitch("enable-features", "UseOzonePlatform");
	app.commandLine.appendSwitch("ozone-platform", "wayland");
}

async function main() {
	await Player.init(updateInfo);

	ipcMain.on("playPause", () => Player.PlayPause());
	ipcMain.on("next", () => Player.Next());
	ipcMain.on("previous", () => Player.Previous());
	ipcMain.on("shuffle", () => Player.Shuffle());
	ipcMain.on("repeat", () => Player.Repeat());
	ipcMain.on("minimize", () => win.minimize());
	ipcMain.on("seek", (_e, perc) => Player.SeekPercentage(perc));
	ipcMain.on("close", () => {
		win.close();
		app.exit();
	});

	ipcMain.on("requestUpdate", async () => {
		await updateInfo();
	});
	ipcMain.on("openExternal", (_e, uri) => {
		shell.openExternal(uri);
	});

	ipcMain.on("updateDiscordPresence", async (_e, presence) => updatePresence(presence));

	ipcMain.handle("getConfig", async () => await getConfig());
	ipcMain.handle("getPosition", async () => Player.GetPosition());
	ipcMain.handle("mxmusertoken", async () => await searchForUserToken());
	ipcMain.handle("getLyrics", async (_e, id) => await getLyrics(id));
	ipcMain.handle("saveLyrics", async (_e, id, data) => await saveLyrics(id, data));

	ipcMain.handle("shouldBullyGlasscordUser", async () => {
		let bullyGlasscordUser = false;
		const gcPath = resolve(app.getPath("appData"), "glasscord");

		try {
			await stat(gcPath);
			bullyGlasscordUser = true;
			await stat(resolve(gcPath, "DONTBULLYME"));
			bullyGlasscordUser = false;
		}catch(_){
			//...
		}

		return bullyGlasscordUser;
	});

	await app.whenReady();
	//setTimeout(spawnWindow, widgetMode ? 1000 : 0);
	await spawnWindow();
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