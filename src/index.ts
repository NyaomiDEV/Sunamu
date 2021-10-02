import { app, BrowserWindow, ipcMain } from "electron";
import { stat } from "fs/promises";
import { resolve } from "path";
import { getUpdate, init, Next, PlayPause, Previous, Shuffle, Repeat, SeekPercentage, GetPosition } from "./mpris2";
import { searchForUserToken } from "./mxmusertoken";

process.title = "sunamu";

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

	ipcMain.on("requestUpdate", async () => {
		await updateInfo();
	});

	ipcMain.handle("getposition", async () => await GetPosition());
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

main();