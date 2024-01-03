import { NowPlayingAPI } from "../../../types";
import { contextBridge, ipcRenderer } from "electron";

const npApi: NowPlayingAPI = {
	previous: () => ipcRenderer.send("previous"),
	playPause: () => ipcRenderer.send("playPause"),
	next: () => ipcRenderer.send("next"),

	shuffle: () => ipcRenderer.send("shuffle"),
	repeat: () => ipcRenderer.send("repeat"),

	seek: (positionToSeekbar) => ipcRenderer.send("seek", positionToSeekbar),
	setPosition: (position) => ipcRenderer.send("setPosition", position),

	registerPositionCallback: (callback) => ipcRenderer.on("position", (_e, ...args) => callback(...args)),
	registerUpdateCallback: (callback) => ipcRenderer.on("update", (_e, ...args) => callback(...args)),
	registerLyricsCallback: (callback) => ipcRenderer.on("refreshLyrics", (_e, ...args) => callback(...args)),
	registerConfigChangedCallback: (callback) => ipcRenderer.on("configChanged", (_e, ...args) => callback(...args)),

	getSongData: () => ipcRenderer.invoke("getSongData"),
	getConfig: () => ipcRenderer.invoke("getConfig"),

	searchAllLyrics: (metadata) => ipcRenderer.invoke("searchAllLyrics", metadata),
	chooseLyrics: (lyrics) => ipcRenderer.send("chooseLyrics", lyrics),

	isWidgetMode: () => ipcRenderer.invoke("isWidgetMode"),
	isDebugMode: () => ipcRenderer.invoke("isDebugMode"),
	isElectronRunning: async () => true,

	getScene: () => ipcRenderer.invoke("getScene"),
	getThemeLocationFor: (theme) => ipcRenderer.invoke("getThemeLocationFor", theme),

	minimize: () => ipcRenderer.send("minimize"),
	close: () => ipcRenderer.send("close"),
	openExternal: (uri) => ipcRenderer.send("openExternal", uri),
};

contextBridge.exposeInMainWorld("np", npApi);
