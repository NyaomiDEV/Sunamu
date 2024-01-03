import { NowPlayingAPI } from "../../../types";
import { io } from "../thirdparty/socket.io.esm.min.js";
import { isElectron } from "../util.js";

if(!isElectron()){
	const socket = io();
	window.np = {
		previous: () => socket.emit("previous"),
		playPause: () => socket.emit("playPause"),
		next: () => socket.emit("next"),

		shuffle: () => socket.emit("shuffle"),
		repeat: () => socket.emit("repeat"),

		seek: (positionToSeekbar) => socket.emit("seek", positionToSeekbar),
		setPosition: (position) => socket.emit("setPosition", position),

		registerPositionCallback: (callback) => socket.on("position", (...args) => callback(...args)),
		registerUpdateCallback: (callback) => socket.on("update", (...args) => callback(...args)),
		registerLyricsCallback: (callback) => socket.on("refreshLyrics", (...args) => callback(...args)),
		registerConfigChangedCallback: (callback) => socket.on("configChanged", (...args) => callback(...args)),

		getSongData: () => new Promise(resolve => socket.emit("getSongData", resolve)),
		getConfig: () => new Promise(resolve => socket.emit("getConfig", resolve)),

		searchAllLyrics: (metadata) => new Promise(resolve => socket.emit("searchAllLyrics", metadata, resolve)),
		chooseLyrics: (lyrics) => socket.emit("chooseLyrics", lyrics),

		isWidgetMode: () => new Promise(resolve => socket.emit("isWidgetMode", resolve)),
		isDebugMode: () => new Promise(resolve => socket.emit("isDebugMode", resolve)),
		isElectronRunning: () => new Promise(resolve => socket.emit("isElectronRunning", resolve)),

		getScene: async () => {
			let sceneName = new URLSearchParams(location.search).get("scene");
			if (!sceneName) {
				if (window.obsstudio)
					sceneName = "obs-studio";
				else
					sceneName = "default";
			}
			return sceneName;
		},
		getThemeLocationFor: (theme) => new Promise(resolve => socket.emit("getThemeLocationFor", theme, resolve)),

		openExternal: (uri) => window.open(uri, "_blank"),
	} as NowPlayingAPI;
}
