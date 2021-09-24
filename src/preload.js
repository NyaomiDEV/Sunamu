const { contextBridge, ipcRenderer } = require("electron");

const npApi = {
	playpause: () => ipcRenderer.send("playpause"),
	next: () => ipcRenderer.send("next"),

	previous: () => ipcRenderer.send("previous"),
	minimize: () => ipcRenderer.send("minimize"),
	close: () => ipcRenderer.send("close"),

	registerUpdateCallback: (callback) => ipcRenderer.on("update", (_e, v) => callback(v))
};

contextBridge.exposeInMainWorld("np", npApi);
