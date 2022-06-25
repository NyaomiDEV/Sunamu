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
	setPosition: (position: number) => void,

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
	positionPollInterval: number,
	karaoke: boolean,
	translations: boolean,
	mxmlanguage: string,
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
	clickableLyrics?: boolean,
	showExtraButtons?: boolean,
	colors?: boolean,
	defaultColorsAreInverted?: boolean,
	colorblock?: boolean,
	bgAnimation?: boolean,
	playerIcon?: boolean
}

export type Palette = {
	Vibrant?: string,
	Muted?: string,
	DarkVibrant?: string,
	DarkMuted?: string,
	LightVibrant?: string,
	LightMuted?: string,
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
	translation?: string,
	time?: number,
	karaoke?: LyricsKaraokeVerse[]
}

export type LyricsKaraokeVerse = {
	text: string,
	start: number
}

export type SpotifyInfo = {
	album?: {
		album_type: string,
		total_tracks: number,
		available_markets: string[],
		external_urls: { spotify: string },
		href: string,
		id: string,
		images: {
			url: string,
			width: number,
			height: number
		}[],
		name: string,
		release_date: string,
		release_date_precision: string,
		restrictions?: { reason: string },
		type: string,
		uri: string,
		album_group?: string,
		artists?: {
			external_urls: { spotify: string },
			href: string,
			id: string,
			name: string,
			type: string,
			uri: string
		}[]
	},
	artists?: {
		external_urls: { spotify: string },
		followers: {
			href: string,
			total: number
		},
		genres: string[],
		href: string,
		id: string,
		images: {
			url: string,
			width: number,
			height: number
		}[],
		name: string,
		popularity: number,
		type: string,
		uri: string
	}[],
	available_markets?: string[],
	disc_number?: number,
	duration_ms?: number,
	explicit?: boolean,
	external_ids?: {
		isrc: string,
		ean: string,
		upc: string
	},
	external_urls: { spotify: string },
	href?: string,
	id: string,
	is_playable?: boolean,
	restrictions?: { reason: string },
	name?: string,
	popularity?: number,
	preview_url?: string,
	track_number?: number,
	type?: string,
	uri: string,
	is_local?: boolean
}

export type LastFMInfo = {
	artist: {
		name: string,
		url: string
	}

	album: {
		artist: string,
		title: string,
		url: string,
		image: {
			"#text": string,
			size: string
		}[],

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