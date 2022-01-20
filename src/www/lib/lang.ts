export const allLangs = {
	en: {
		NOT_PLAYING: "Not playing",
		PLEASE_PLAY_SONG: "Please play something",
		PLAYING_ON_APP: "Playing on %APP%",
		PLAY_COUNT: "Played %COUNT% times",
		NO_LYRICS: "No lyrics available",
		NOW_PLAYING_TITLE: "\"%TITLE%\" by %ARTIST%",
		UNKNOWN_ARTIST: "Unknown artist",
		UNKNOWN_TITLE: "Unknown title"
	},
	it: {
		NOT_PLAYING: "Nessuna traccia in riproduzione",
		PLEASE_PLAY_SONG: "Per favore riproduci qualcosa",
		PLAYING_ON_APP: "Riproducendo su %APP%",
		PLAY_COUNT: "Riprodotto %COUNT% volte",
		NO_LYRICS: "I testi non sono disponibili",
		NOW_PLAYING_TITLE: "\"%TITLE%\" di %ARTIST%",
		UNKNOWN_ARTIST: "Artista sconosciuto",
		UNKNOWN_TITLE: "Titolo sconosciuto"
	}
};

export default (allLangs[navigator.language.split("-")[0]] || allLangs.en);