export type NowPlayingAPI = {
	playpause: () => void,
	next: () => void,
	previous: () => void,
	shuffle: () => void,
	repeat: () => void,

	minimize: () => void,
	close: () => void,

	// eslint-disable-next-line no-unused-vars
	registerUpdateCallback: (callback: Function) => void
}

export type Metadata = {
	title: string,
	album: string,
	artist: string,
	artUrl: string,
	length: number
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