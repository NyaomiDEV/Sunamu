import { NowPlayingAPI } from "../src/types";
declare global {
	export type Lyrics = {
		provider: string,
		synchronized: boolean,
		lines: LyricsLine[],
		copyright: string
	}

	export type LyricsLine = {
		text: string,
		time?: number
	}

	export type LrcFile = {
		lines: LyricsLine[],
		metadata: {
			[x: string]: string
		}
	}

	// eslint-disable-next-line no-unused-vars
	interface Window {
		np: NowPlayingAPI;
		widgetMode: boolean;
		debugMode: boolean;
	}
}
