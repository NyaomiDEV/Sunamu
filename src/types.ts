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

export type Update = {
	metadata: Metadata,
	status: string,
	elapsed: number,
	app: string,
	appName: string
}