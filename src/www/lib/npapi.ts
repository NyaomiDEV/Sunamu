import { NowPlayingAPI } from "../../types";
import { io } from "./thirdparty/socket.io.esm.min.js";
import { isElectron } from "./util.js";

if(!isElectron()){
	const socket = io();
	window.np = {
		previous: () => socket.emit("previous"),
		playPause: () => socket.emit("playPause"),
		next: () => socket.emit("next"),

		shuffle: () => socket.emit("shuffle"),
		repeat: () => socket.emit("repeat"),

		seek: (positionToSeekbar) => socket.emit("seek", positionToSeekbar),
		getPosition: () => new Promise(resolve => socket.emit("getPosition", resolve)),

		getLyrics: (id) => new Promise(resolve => socket.emit("getLyrics", id, resolve)),
		//saveLyrics: (id, data) => new Promise(resolve => socket.emit("saveLyrics", id, data, resolve)),
		saveLyrics: async () => false,

		mxmusertoken: () => new Promise(resolve => socket.emit("mxmusertoken", resolve)),

		getDiscordPresenceConfig: () => new Promise(resolve => socket.emit("getDiscordPresenceConfig", resolve)),
		updateDiscordPresence: (presence) => socket.emit("updateDiscordPresence", presence),

		registerUpdateCallback: (callback) => socket.on("update", v => callback(v)),
		registerLyricsCallback: (callback) => socket.on("refreshLyrics", () => callback()),
		requestUpdate: () => socket.emit("requestUpdate"),

		getConfig: () => new Promise(resolve => socket.emit("getConfig", resolve)),

		shouldBullyGlasscordUser: () => new Promise(resolve => socket.emit("shouldBullyGlasscordUser", resolve)),

		isWidgetMode: () => new Promise(resolve => socket.emit("isWidgetMode", resolve)),
		isDebugMode: () => new Promise(resolve => socket.emit("isDebugMode", resolve)),
		isElectronRunning: () => new Promise(resolve => socket.emit("isElectronRunning", resolve)),

		openExternal: (uri) => window.open(uri, "_blank"),
	} as NowPlayingAPI;
}
