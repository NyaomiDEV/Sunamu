import { NowPlayingAPI, SongData, LyricsLine } from "../src/types";

declare global {
	export type LrcFile = {
		lines: LyricsLine[],
		metadata: {
			[x: string]: string
		}
	}

	// eslint-disable-next-line no-unused-vars
	interface Window {
		title: string,
		np: NowPlayingAPI;
		widgetMode: boolean;
		debugMode: boolean;
		getNowPlaying?: () => SongData
	}
}
