import getPlayer, { Player } from "./player";
import WebServer from "./webserver";
import Electron from "./electron";
import { updateInfo } from "./eventDispatcher";
import { useElectron, useWebserver } from "./appStatus";

process.title = "sunamu";

let player: Player;

async function main() {
	player = await getPlayer();
	player.init(updateInfo);

	if(useElectron) await Electron();
	if(useWebserver) await WebServer();
}

main();