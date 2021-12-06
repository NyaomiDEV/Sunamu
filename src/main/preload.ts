import { contextBridge, ipcRenderer } from "electron";
import { NowPlayingAPI } from "../types";

const npApi: NowPlayingAPI = {
	previous: () => ipcRenderer.send("previous"),
	playPause: () => ipcRenderer.send("playPause"),
	next: () => ipcRenderer.send("next"),

	shuffle: () => ipcRenderer.send("shuffle"),
	repeat: () => ipcRenderer.send("repeat"),

	seek: (positionToSeekbar) => ipcRenderer.send("seek", positionToSeekbar),
	getPosition: () => ipcRenderer.invoke("getPosition"),

	registerUpdateCallback: (callback) => ipcRenderer.on("update", (_e, songdata, metadataChanged) => callback(songdata, metadataChanged)),
	registerLyricsCallback: (callback) => ipcRenderer.on("refreshLyrics", () => callback()),

	requestUpdate: () => ipcRenderer.send("requestUpdate"),
	requestSongData: () => ipcRenderer.send("requestSongData"),

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
