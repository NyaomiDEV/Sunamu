import { app, BrowserWindow, ipcMain, shell } from "electron";
import { copyFile, readFile, stat } from "fs/promises";
import { resolve } from "path";
import { getUpdate, init, Next, PlayPause, Previous, Shuffle, Repeat, SeekPercentage, GetPosition } from "./mpris2";
import { searchForUserToken } from "./mxmusertoken";
import { debug } from "./util";
import JSON5 from "json5";

process.title = "sunamu";

const widgetMode = !!process.env.ILOVEGLASS;

let win: BrowserWindow;

if(widgetMode)
	debug("Widget mode");

app.commandLine.appendSwitch("use-gl", "desktop");

if(process.env.WAYLAND_DISPLAY && process.env.XDG_SESSION_TYPE === "wayland"){
	// We are in a Wayland session, most probably
	app.commandLine.appendSwitch("enable-features", "UseOzonePlatform");
	app.commandLine.appendSwitch("ozone-platform", "wayland");
}

async function main() {
	await init(updateInfo);

	ipcMain.on("playpause", () => PlayPause());
	ipcMain.on("next", () => Next());
	ipcMain.on("previous", () => Previous());
	ipcMain.on("shuffle", () => Shuffle());
	ipcMain.on("repeat", () => Repeat());
	ipcMain.on("minimize", () => win.minimize());
	ipcMain.on("seek", (_e, perc) => SeekPercentage(perc));
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

	ipcMain.handle("getConfig", async () => await getConfig());
	ipcMain.handle("getPosition", async () => await GetPosition());
	ipcMain.handle("mxmusertoken", async () => await searchForUserToken());
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
		minWidth: 458,
		minHeight: 512,
		backgroundColor: widgetMode ? "#00000000" : "#000000",
		maximizable: !widgetMode,
		minimizable: !widgetMode,
		resizable: true,
		fullscreenable: !widgetMode,
		skipTaskbar: widgetMode,
		type: widgetMode ? "dialog" : "normal",
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: resolve(__dirname, "preload.js")
		},
		roundedCorners: true,
		icon: resolve(__dirname, "..", "assets", "icons", "512x512.png")
	});
	if (process.env.DEBUG) win.webContents.openDevTools();
	win.loadFile(resolve(__dirname, "..", "www", "index.htm"));
}

async function updateInfo(){
	const update = await getUpdate();
	if(update)
		win?.webContents?.send("update", update);
	else
		win?.webContents?.send("update");
}

async function getConfig(){
	const configPath = resolve(app.getPath("appData"), "sunamu", "config.json5");
	const defaultConfigPath = resolve(__dirname, "..", "assets", "config.json5");
	try {
		return JSON5.parse(await readFile(configPath, "utf8"));
	} catch (_) {
		await copyFile(defaultConfigPath, configPath);
		JSON5.parse(await readFile(configPath, "utf8"));
	}
}

main();