export const allLangs = {
	en: {
		NOT_PLAYING: "Not playing",
		PLEASE_PLAY_SONG: "Please play something",
		PLAYING_ON_APP: "Playing on %APP%",
		NO_LYRICS: "No lyrics available",
		NOW_PLAYING_TITLE: "\"%TITLE%\" by %ARTIST%"
	},
	it: {
		NOT_PLAYING: "Nessuna traccia in riproduzione",
		PLEASE_PLAY_SONG: "Per favore riproduci qualcosa",
		PLAYING_ON_APP: "Riproducendo su %APP%",
		NO_LYRICS: "I testi non sono disponibili",
		NOW_PLAYING_TITLE: "\"%TITLE%\" di %ARTIST%"
	}
};

export default (allLangs[navigator.language.split("-")[0]] || allLangs.en);