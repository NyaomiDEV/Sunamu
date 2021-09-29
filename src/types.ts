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

	mxmusertoken: () => Promise<string | undefined>
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