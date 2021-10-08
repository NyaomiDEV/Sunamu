/* eslint-disable no-unused-vars */
export type NowPlayingAPI = {
	previous: () => void,
	playpause: () => void,
	next: () => void,

	shuffle: () => void,
	repeat: () => void,

	seek: (positionToSeekbar: number) => void,
	getposition: () => Promise<number>

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
}

export type Config = {
	lfmUsername: string,
	spotify: {
		clientId: string,
		clientSecret: string
	}
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