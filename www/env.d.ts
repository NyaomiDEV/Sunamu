import { NowPlayingAPI, Update } from "../src/types";
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

	export type LastFMInfo = {
		artist: {
			name: string,
			url: string
		}
		name: string,
		duration: string,
		url: string,
		mbid?: string,

		listeners: string,
		playcount: string,

		userloved?: string,
		userplaycount?: string,

		streamable: {
			fulltrack: string,
			"#text": string
		},

		toptags: {
			tags: any[]
		}
	}

	export type SongData = Update & {
		lyrics?: Lyrics
		lastfm?: LastFMInfo,
		spotiUrl?: string
	}

	// eslint-disable-next-line no-unused-vars
	interface Window {
		np: NowPlayingAPI;
		widgetMode: boolean;
		debugMode: boolean;
		getNowPlaying?: () => SongData
	}
}
