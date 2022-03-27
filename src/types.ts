export type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
};

/* eslint-disable no-unused-vars */
export type NowPlayingAPI = {
	previous: () => void,
	playPause: () => void,
	next: () => void,

	shuffle: () => void,
	repeat: () => void,

	seek: (positionToSeekbar: number) => void,

	registerPositionCallback: (callback: Function) => void,
	registerUpdateCallback: (callback: Function) => void,
	registerLyricsCallback: (callback: Function) => void,

	getSongData: () => Promise<SongData>,
	getConfig: () => Promise<Config>,

	shouldBullyGlasscordUser: () => Promise<boolean>,

	isWidgetMode: () => Promise<boolean>,
	isDebugMode: () => Promise<boolean>,
	isElectronRunning?: () => Promise<boolean>,

	getScene: () => Promise<string | undefined>,
	getThemeLocationFor: (scene: string) => Promise<string | undefined>,

	minimize?: () => void,
	close?: () => void,
	openExternal: (uri: string) => void,
}

export type Config = {
	language?: string,
	useElectron: boolean,
	useWebserver: boolean,
	debugMode: boolean,
	waylandOzone: boolean,
	lfmUsername: string,
	mxmusertoken: string,
	spotify: SpotifyConfig,
	discordRpc: DiscordPresenceConfig,
	scenes: {
		[sceneName: string]: SceneConfig
	},
}

export type SpotifyConfig = {
	clientID: string,
	clientSecret: string
}

export type DiscordPresenceConfig = {
	enabled: boolean,
	blacklist: string[]
}

export type SceneConfig = {
	type: "default" | "electron",
	widgetMode?: boolean,
	font?: string,
	theme?: string,
	nonInteractive?: boolean,
	static?: boolean,
	showAlbumArt?: boolean,
	showControls?: boolean,
	showProgress?: boolean,
	showPlayingIndicator?: boolean,
	showLyrics?: boolean,
	lyricsBlur?: boolean,
	showExtraButtons?: boolean,
	colors?: boolean,
	defaultColorsAreInverted?: boolean,
	colorblock?: boolean
	playerIcon?: boolean
}

export type Palette = {
	Vibrant: string,
	Muted: string,
	DarkVibrant: string,
	DarkMuted: string,
	LightVibrant: string,
	LightMuted: string,
}

export type ArtData = {
	type: string[],
	data: Buffer,
	palette?: Palette
}

export type Metadata = {
	title: string,
	album: string,
	albumArtist?: string,
	albumArtists?: string[],
	artist: string,
	artists: string[],
	artUrl?: string,
	artData?: ArtData,
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
	provider: "MPRIS2" | "WinPlayer",
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
	reportsPosition: boolean,
	lyrics?: Lyrics,
	lastfm?: LastFMInfo,
	spotify?: SpotifyInfo
}

export type Lyrics = {
	provider: string,
	synchronized: boolean,
	lines: LyricsLine[],
	copyright?: string
}

export type LyricsLine = {
	text: string,
	time?: number
}

export type SpotifyInfo = {
	id: string,
	uri: string,
	external_urls: { spotify: string },
	[any: string]: any
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

export type LrcFile = {
	lines: LyricsLine[],
	metadata: {
		[x: string]: string
	}
}