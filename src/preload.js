const { contextBridge, ipcRenderer } = require("electron");

/** @type {import("./types").NowPlayingAPI} */
const npApi = {
	previous: () => ipcRenderer.send("previous"),
	playpause: () => ipcRenderer.send("playpause"),
	next: () => ipcRenderer.send("next"),

	shuffle: () => ipcRenderer.send("shuffle"),
	repeat: () => ipcRenderer.send("repeat"),

	seek: (positionToSeekbar) => ipcRenderer.send("seek", positionToSeekbar),
	getposition: () => ipcRenderer.invoke("getposition"),

	minimize: () => ipcRenderer.send("minimize"),
	close: () => ipcRenderer.send("close"),

	registerUpdateCallback: (callback) => ipcRenderer.on("update", (_e, v) => callback(v)),
	requestUpdate: () => ipcRenderer.send("requestUpdate"),
	openExternal: (uri) => ipcRenderer.send("openExternal", uri),

	mxmusertoken: () => ipcRenderer.invoke("mxmusertoken"),
	shouldBullyGlasscordUser: () => ipcRenderer.invoke("shouldBullyGlasscordUser"),
};

contextBridge.exposeInMainWorld("np", npApi);
contextBridge.exposeInMainWorld("widgetMode", !!process.env.ILOVEGLASS);
contextBridge.exposeInMainWorld("debugMode", !!process.env.DEBUG);
