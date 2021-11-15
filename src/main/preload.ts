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

	getLyrics: (id) => ipcRenderer.invoke("getLyrics", id),
	saveLyrics: (id, data) => ipcRenderer.invoke("saveLyrics", id, data),

	mxmusertoken: () => ipcRenderer.invoke("mxmusertoken"),

	getDiscordPresenceConfig: () => ipcRenderer.invoke("getDiscordPresenceConfig"),
	updateDiscordPresence: (presence) => ipcRenderer.send("updateDiscordPresence", presence),

	registerUpdateCallback: (callback) => ipcRenderer.on("update", (_e, v) => callback(v)),
	requestUpdate: () => ipcRenderer.send("requestUpdate"),

	minimize: () => ipcRenderer.send("minimize"),
	close: () => ipcRenderer.send("close"),

	openExternal: (uri) => ipcRenderer.send("openExternal", uri),
	getConfig: () => ipcRenderer.invoke("getConfig"),

	shouldBullyGlasscordUser: () => ipcRenderer.invoke("shouldBullyGlasscordUser"),

	isWidgetMode: () => ipcRenderer.invoke("isWidgetMode"),
	isDebugMode: () => ipcRenderer.invoke("isDebugMode")
};

contextBridge.exposeInMainWorld("np", npApi);
