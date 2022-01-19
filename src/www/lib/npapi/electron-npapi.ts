import { NowPlayingAPI } from "../../../types";
import { contextBridge, ipcRenderer } from "electron";

const npApi: NowPlayingAPI = {
	previous: () => ipcRenderer.send("previous"),
	playPause: () => ipcRenderer.send("playPause"),
	next: () => ipcRenderer.send("next"),

	shuffle: () => ipcRenderer.send("shuffle"),
	repeat: () => ipcRenderer.send("repeat"),

	seek: (positionToSeekbar) => ipcRenderer.send("seek", positionToSeekbar),

	registerPositionCallback: (callback) => ipcRenderer.on("position", (_e, position) => callback(position)),
	registerUpdateCallback: (callback) => ipcRenderer.on("update", (_e, songdata, metadataChanged) => callback(songdata, metadataChanged)),
	registerLyricsCallback: (callback) => ipcRenderer.on("refreshLyrics", () => callback()),

	getSongData: () => ipcRenderer.invoke("getSongData"),

	getConfig: () => ipcRenderer.invoke("getConfig"),

	shouldBullyGlasscordUser: () => ipcRenderer.invoke("shouldBullyGlasscordUser"),

	isWidgetMode: () => ipcRenderer.invoke("isWidgetMode"),
	isDebugMode: () => ipcRenderer.invoke("isDebugMode"),
	isElectronRunning: async () => true,

	minimize: () => ipcRenderer.send("minimize"),
	close: () => ipcRenderer.send("close"),
	openExternal: (uri) => ipcRenderer.send("openExternal", uri),
};

contextBridge.exposeInMainWorld("np", npApi);
