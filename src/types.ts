import { Presence } from "discord-rpc";

/* eslint-disable no-unused-vars */
export type NowPlayingAPI = {
	previous: () => void,
	playPause: () => void,
	next: () => void,

	shuffle: () => void,
	repeat: () => void,

	seek: (positionToSeekbar: number) => void,
	getPosition: () => Promise<number>

	minimize: () => void,
	close: () => void,

	registerUpdateCallback: (callback: Function) => void,
	requestUpdate: () => void,
	openExternal: (uri: string) => void,
	getConfig: () => Promise<Config>,
	getLyrics: (id: string) => Promise<Lyrics | undefined>,
	saveLyrics: (id: string, data: Lyrics) => Promise<boolean>,

	mxmusertoken: () => Promise<string | undefined>
	shouldBullyGlasscordUser: () => Promise<boolean>

	updateDiscordPresence: (presence: Presence) => void
}

export type Config = {
	lfmUsername: string,
	spotify: {
		clientId: string,
		clientSecret: string
	},
	discordRpc: boolean
}

export type Metadata = {
	title: string,
	album: string,
	albumArtist?: string,
	albumArtists?: string[],
	artist: string,
	artists: string[],
	artUrl: string,
	length: number,
	id: string
}

export type Capabilities = {
	canControl: boolean,
	canPlayPause: boolean,
	canGoNext: boolean,
	canGoPrevious: boolean,
	canSeek: boolean
}

export type Update = {
	provider: "MPRIS2",
	metadata: Metadata,
	capabilities: Capabilities,
	status: string,
	loop: string,
	shuffle: boolean,
	volume: number,
	elapsed: number,
	app: string,
	appName: string
}

export type SongData = Update & {
	lyrics?: Lyrics,
	lastfm?: LastFMInfo,
	spotiUrl?: string
}

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