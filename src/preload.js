const { contextBridge, ipcRenderer } = require("electron");
const { checkSwitch } = require("./util");

/** @type {import("./types").NowPlayingAPI} */
const npApi = {
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
};

contextBridge.exposeInMainWorld("np", npApi);
contextBridge.exposeInMainWorld("widgetMode", checkSwitch(process.env.ILOVEGLASS));
contextBridge.exposeInMainWorld("debugMode", checkSwitch(process.env.DEBUG));
