import getPlayer, { Player } from "./player";
import { addUpdateCallback, updateInfo } from "./playbackStatus";
import { debugMode, useElectron, useWebserver } from "./appStatus";
import { updatePresence } from "./integrations/discordrpc";

export function debug(...args: any) {
	if(debugMode)
		console.log(...args);
}

process.title = "sunamu";

let player: Player;

async function main() {
	player = await getPlayer();
	player.init(updateInfo);

	if(useElectron){
		const Electron = await import("./electron");
		await Electron.default();
	}

	if(useWebserver){
		const WebServer = await import("./webserver");
		await WebServer.default();
	}

	addUpdateCallback(async () => {
		updatePresence();
	});
}

main();