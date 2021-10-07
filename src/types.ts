export type NowPlayingAPI = {
	previous: () => void,
	playpause: () => void,
	next: () => void,

	shuffle: () => void,
	repeat: () => void,

	// eslint-disable-next-line no-unused-vars
	seek: (positionToSeekbar: number) => void,
	getposition: () => Promise<number>

	minimize: () => void,
	close: () => void,

	// eslint-disable-next-line no-unused-vars
	registerUpdateCallback: (callback: Function) => void,
	requestUpdate: () => void,
	// eslint-disable-next-line no-unused-vars
	openExternal: (uri: string) => void,
	getConfig: () => Promise<Config>,

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