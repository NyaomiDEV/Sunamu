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

		registerPositionCallback: (callback) => socket.on("position", (position) => callback(position)),
		registerUpdateCallback: (callback) => socket.on("update", (songdata, metadataChanged) => callback(songdata, metadataChanged)),
		registerLyricsCallback: (callback) => socket.on("refreshLyrics", () => callback()),

		getSongData: () => new Promise(resolve => socket.emit("getSongData", resolve)),
		getConfig: () => new Promise(resolve => socket.emit("getConfig", resolve)),

		shouldBullyGlasscordUser: () => new Promise(resolve => socket.emit("shouldBullyGlasscordUser", resolve)),

		isWidgetMode: () => new Promise(resolve => socket.emit("isWidgetMode", resolve)),
		isDebugMode: () => new Promise(resolve => socket.emit("isDebugMode", resolve)),
		isElectronRunning: () => new Promise(resolve => socket.emit("isElectronRunning", resolve)),

		openExternal: (uri) => window.open(uri, "_blank"),
	} as NowPlayingAPI;
}
