const { contextBridge, ipcRenderer } = require("electron");

const npApi = {
	playpause: () => ipcRenderer.send("playpause"),
	next: () => ipcRenderer.send("next"),
	shuffle: () => ipcRenderer.send("shuffle"),
	repeat: () => ipcRenderer.send("repeat"),

	previous: () => ipcRenderer.send("previous"),
	minimize: () => ipcRenderer.send("minimize"),
	close: () => ipcRenderer.send("close"),

	registerUpdateCallback: (callback) => ipcRenderer.on("update", (_e, v) => callback(v))
};

contextBridge.exposeInMainWorld("np", npApi);
contextBridge.exposeInMainWorld("transparentBackground", process.env.ILOVEGLASS === "1");
contextBridge.exposeInMainWorld("debugMode", process.env.DEBUG === "1");
