import { app, BrowserWindow, ipcMain } from "electron";
import { resolve } from "path";
import { getUpdate, init, Next, PlayPause, Previous, Shuffle, Repeat, SeekPercentage, GetPosition } from "./mpris2";
import { searchForUserToken } from "./mxmusertoken";

const widgetMode = !!process.env.ILOVEGLASS;

let win: BrowserWindow;

if(widgetMode){
	console.log("Widget mode");
	//app.disableHardwareAcceleration();
	app.commandLine.appendSwitch("use-gl", "desktop");
	//app.commandLine.appendSwitch("enable-transparent-visuals");
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

	ipcMain.handle("getposition", async () => await GetPosition());
	ipcMain.handle("mxmusertoken", async () => await searchForUserToken());

	await app.whenReady();
	//setTimeout(spawnWindow, widgetMode ? 1000 : 0);
	await spawnWindow();
}

async function spawnWindow() {
	win = new BrowserWindow({
		show: true,
		frame: false,
		transparent: widgetMode,
		minWidth: 850,
		minHeight: 950,
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

	win.loadFile(resolve(__dirname, "..", "www", "index.htm"));
	//win.webContents.openDevTools();

	win.webContents.on("did-finish-load", async () => await updateInfo());
}

async function updateInfo(){
	const update = await getUpdate();
	if(update)
		win?.webContents?.send("update", update);
	else
		win?.webContents?.send("update");
}

main();