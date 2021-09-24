const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("np", {
	playpause: () => ipcRenderer.send("playpause"),
	next: () => ipcRenderer.send("next"),
	previous: () => ipcRenderer.send("previous"),
	minimize: () => ipcRenderer.send("minimize"),
	close: () => ipcRenderer.send("close"),
	on: (event, callback) => ipcRenderer.on(event, (e, v) => callback(v))
});
