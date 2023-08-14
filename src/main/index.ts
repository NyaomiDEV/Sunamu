import getPlayer, { Player } from "./player";
import { addSongDataCallback, updateInfo } from "./playbackStatus";
import { consolidateConfig, lyricsActive, useElectron, useWebserver } from "./appStatus";
import { updatePresence } from "./integrations/discordrpc";
import { logTrack } from "./integrations/tracklogger";
import Instance from "./instance";
import { manageLyricsCache } from "./integrations/lyricsOffline";
import { consolidateToDefaultConfig } from "./config";
import { logToDebug } from "./logger";
export { logToDebug as debug };

process.title = "sunamu";

let player: Player;

async function main(): Promise<void> {
	const instance = new Instance();
	const haveLock = await instance.requestLock();

	if(!haveLock){
		console.error("Another instance is running!");
		return process.exit(1); // for some reason I can't just process.exit because thanks Node on Windows
	}

	if(consolidateConfig)
		consolidateToDefaultConfig();

	let _useWebserver = useWebserver;
	player = await getPlayer();
	player.init(updateInfo);

	if(useElectron){
		logToDebug("Loading Electron");
		try{
			const Electron = await import("./electron");
			await Electron.default();
		}catch(_e){
			console.error("Electron is not available. Perhaps you are using vanilla Node?\nForcing Webserver!");
			_useWebserver = true;
		}
	}

	if(_useWebserver){
		logToDebug("Loading Webserver");
		const WebServer = await import("./webserver");
		await WebServer.default();
	}

	addSongDataCallback(async (_songdata?, metadataChanged?) => {
		updatePresence();
		if(metadataChanged)
			logTrack();
	});

	// Lyrics cache management
	if(lyricsActive)
		await manageLyricsCache();
}

main();