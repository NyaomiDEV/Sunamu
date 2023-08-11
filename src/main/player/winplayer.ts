import { ArtData, Update } from "../../types";

// @ts-ignore
import Player, { Player as IPlayer } from "winplayer-node";
import Vibrant from "node-vibrant";

import { debug } from "..";
import sharp from "sharp";

let _player: IPlayer;

export async function init(callback: Function): Promise<void>{
	const _cb = async () => callback(await getUpdate());
	_player = new Player(_cb);
}

export async function getUpdate(): Promise<Update | null> {
	const update = await _player.getUpdate();
	debug("Update got on Win32", update);

	if(update !== null){
		if (typeof update.metadata === "undefined"){
			update.metadata = {
				title: "",
				artist: "",
				artists: [],
				albumArtists: [],
				length: 0
			}
		}

		if (update.metadata?.artData) {
			try {
				const palettebuffer = await sharp(update.metadata.artData.data)
					.resize(512, 512, { withoutEnlargement: true })
					.png()
					.toBuffer();
				const palette = await (new Vibrant(palettebuffer, {
					colorCount: 16,
					quality: 1
				})).getPalette();
				if (palette) {

					(update.metadata.artData as ArtData).palette = {
						DarkMuted: palette.DarkMuted?.hex,
						DarkVibrant: palette.DarkVibrant?.hex,
						LightMuted: palette.LightMuted?.hex,
						LightVibrant: palette.LightVibrant?.hex,
						Muted: palette.Muted?.hex,
						Vibrant: palette.Vibrant?.hex,
					};
				}
			} catch (e) {
				debug("Couldn't compute palette for image", e);
			}
		}
	}

	return update as Update | null;
}

export function Play() {
	return _player.Play();
}

export function Pause() {
	return _player.Pause();
}

export function PlayPause() {
	return _player.PlayPause();
}

export function Stop() {
	return _player.Stop();
}

export function Next() {
	return _player.Next();
}

export function Previous() {
	return _player.Previous();
}

export function Shuffle() {
	return _player.Shuffle();
}

export function Repeat() {
	return _player.Repeat();
}

export function Seek(offset: number) {
	return _player.Seek(offset);
}

export function SeekPercentage(percentage: number) {
	return _player.SeekPercentage(percentage);
}

export function SetPosition(position: number) {
	return _player.SetPosition(position);
}

export async function GetPosition() {
	debug("Position queried on Win32");
	const _pos = _player.GetPosition();
	debug("Position", _pos);
	return _pos;
}
