import { stat } from "fs/promises";
import { resolve } from "path";
import getPlayer, { Player } from "./player";
import { searchForUserToken } from "./integrations/mxmusertoken";
import { get as getLyrics, save as saveLyrics } from "./integrations/lyricsOffline";
import { getPresenceConfig, updatePresence } from "./integrations/discord-rpc";
import { getAll as getAllConfig } from "./config";
import { widgetModeWeb, debugMode, getAppData, useElectron } from "./appStatus";

import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { Server as StaticServer } from "node-static";
import { addCallback, updateInfo } from "./eventDispatcher";

let player: Player;

const file = new StaticServer(resolve(__dirname, "..", "www"), { indexFile: "index.htm", headers: { "Access-Control-Allow-Origin": "*"} });
const server = createServer((req, res) => file.serve(req, res));

export const io = new Server(server);

function registerSocketIO(socket: Socket) {
	socket.on("previous", () => player.Previous());
	socket.on("playPause", () => player.PlayPause());
	socket.on("next", () => player.Next());

	socket.on("shuffle", () => player.Shuffle());
	socket.on("repeat", () => player.Repeat());

	socket.on("seek", (perc) => player.SeekPercentage(perc));
	socket.on("getPosition", async (callback) => callback(await player.GetPosition()));

	socket.on("getLyrics", async (id, callback) => callback(await getLyrics(id)));
	socket.on("saveLyrics", async (id, data, callback) => callback(await saveLyrics(id, data)));

	socket.on("mxmusertoken", async (callback) => callback(await searchForUserToken()));

	socket.on("updateDiscordPresence", (presence) => updatePresence(presence));
	socket.on("getDiscordPresenceConfig", async (callback) => callback(await getPresenceConfig()));

	socket.on("requestUpdate", async () => await updateInfo());

	socket.on("getConfig", (callback) => callback(getAllConfig()));

	socket.on("shouldBullyGlasscordUser", async (callback) => {
		let bullyGlasscordUser = false;
		const gcPath = resolve(getAppData(), "glasscord");

		try {
			await stat(gcPath);
			bullyGlasscordUser = true;
			await stat(resolve(gcPath, "DONTBULLYME"));
			bullyGlasscordUser = false;
		} catch (_) {
			//...
		}

		callback(bullyGlasscordUser);
	});

	socket.on("isWidgetMode", (callback) => callback(widgetModeWeb));
	socket.on("isDebugMode", (callback) => callback(debugMode));
	socket.on("isElectronRunning", (callback) => callback(useElectron));

	addCallback(update => socket.emit("update", update));
}

export default async function webserverMain(){
	player = await getPlayer();

	server.listen(3000, () => console.log("WebServer listening on port 3000"));

	io.on("connection", socket => {
		registerSocketIO(socket);
	});
}
