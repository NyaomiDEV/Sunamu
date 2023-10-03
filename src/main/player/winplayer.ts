import { Position, Update } from "../../types";

// @ts-ignore
import { Player, PlayerManager, getFriendlyNameFor, getPlayerManager } from "winplayer-rs";
import Vibrant from "node-vibrant";

import { debug } from "..";
import sharp from "sharp";

let _player: Player | null;
let _denylist: string[] | undefined;
// there is no pass by reference so we will make our makeshift ref here
type RevokeToken = { revoked: boolean };
let _revokeToken: RevokeToken = { revoked: false };
let updateCallback: Function;

export async function init(callback: Function, denylist?: string[]): Promise<void>{
	_denylist = denylist;
	updateCallback = callback;
	const playerManager = await getPlayerManager();
	if(playerManager) 
		managerEvents(playerManager);
	
}

export async function managerEvents(playerManager: PlayerManager) {
	// eslint-disable-next-line no-constant-condition
	while(true) {
		if(!playerManager) break;
		const evt = await playerManager.pollNextEvent();
		switch(evt) {
			case "ActiveSessionChanged":
				_player = null;
				_revokeToken.revoked = true;
				const player = playerManager.getActiveSession();
				if(player){
					_player = player;
					_revokeToken.revoked = false;
					playerEvents();
				}
				updateCallback(await getUpdate());
				break;
			case "SystemSessionChanged":
				playerManager.updateSystemSession();
				break;
			case "SessionsChanged":
				playerManager.updateSessions(_denylist);
				break;
		}
	}
}

export async function playerEvents(){
	// eslint-disable-next-line no-constant-condition
	while(true) {
		if(_revokeToken.revoked) break;
		if(!_player) break;
		const evt = await _player.pollNextEvent();
		switch(evt) {
			case "PlaybackInfoChanged":
				updateCallback(await getUpdate());
				break;
			case "TimelinePropertiesChanged":
				updateCallback(await getUpdate());
				break;
			case "MediaPropertiesChanged":
				updateCallback(await getUpdate());
				break;
		}
	}
}

export async function getUpdate(): Promise<Update | null> {
	const status = await _player?.getStatus();

	if(status){
		if (typeof status.metadata === "undefined"){
			status.metadata = {
				title: "",
				artist: "",
				artists: [],
				albumArtists: [],
				length: 0
			};
		}

		
		const update: Update = {
			provider: "WinPlayer",
			metadata: {
				title: status.metadata.title,
				album: status.metadata.album ?? "",
				albumArtist: status.metadata.albumArtist,
				albumArtists: status.metadata.albumArtists,
				artist: status.metadata.artist,
				artists: status.metadata.artists,
				artUrl: undefined,
				artData: undefined,
				length: status.metadata.length,
				count: undefined,
				lyrics: undefined,
				id: status.metadata.id ?? "",
				location: undefined
			},
			capabilities: status.capabilities,
			status: status.status,
			loop: status.isLoop,
			shuffle: status.shuffle,
			volume: status.volume,
			elapsed: status.elapsed ?? { howMuch: 0, when: new Date(0)},
			app: status.app ?? "",
			appName: status.app ? await getFriendlyNameFor(status.app) ?? status.app ?? "" : status.app ?? ""
		};

		if (status.metadata?.artData) {
			try {
				const palettebuffer = await sharp(status.metadata.artData.data)
					.resize(512, 512, { withoutEnlargement: true })
					.png()
					.toBuffer();
				const palette = await (new Vibrant(palettebuffer, {
					colorCount: 16,
					quality: 1
				})).getPalette();
				if (palette) {

					update.metadata.artData = {
						data: status.metadata.artData.data,
						type: [
							status.metadata.artData.mimetype
						],
						palette: {
							DarkMuted: palette.DarkMuted?.hex,
							DarkVibrant: palette.DarkVibrant?.hex,
							LightMuted: palette.LightMuted?.hex,
							LightVibrant: palette.LightVibrant?.hex,
							Muted: palette.Muted?.hex,
							Vibrant: palette.Vibrant?.hex,
						}
					};
				}
			} catch (e) {
				debug("Couldn't compute palette for image", e);
			}
		}
		return update;
	}
	return null;
}

export async function Play() {
	return await _player?.play();
}

export async function Pause() {
	return await _player?.pause();
}

export async function PlayPause() {
	return await _player?.playPause();
}

export async function Stop() {
	return await _player?.stop();
}

export async function Next() {
	return await _player?.next();
}

export async function Previous() {
	return await _player?.previous();
}

export async function Shuffle() {
	const shuffle = await _player?.getShuffle();
	return _player?.setShuffle(!shuffle);
}

export async function Repeat() {
	const repeat = await _player?.getRepeat();
	switch(repeat){
		case "List":
		default:
			return await _player?.setRepeat("None");
		case "None":
			return await _player?.setRepeat("Track");
		case "Track":
			return await _player?.setRepeat("List");
	}
}

export async function Seek(offset: number) {
	return await _player?.seek(offset);
}

export async function SeekPercentage(percentage: number) {
	return await _player?.seekPercentage(percentage);
}

export async function SetPosition(position: number) {
	return await _player?.setPosition(position);
}

export async function GetPosition(): Promise<Position> {
	const pos = await _player?.getPosition(true);
	if(!pos) {
		return {
			howMuch: 0,
			when: new Date(0)
		};
	}
	return pos;
}
