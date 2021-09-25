export type NowPlayingAPI = {
	playpause: () => void,
	next: () => void,
	previous: () => void,

	minimize: () => void,
	close: () => void,

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
	canChangeTrack: boolean,
	hasSeekbar: boolean
}

export type Update = {
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