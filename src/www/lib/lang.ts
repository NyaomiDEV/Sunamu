import config from "./config.js";

export const allLangs = {
	en: {
		NOT_PLAYING: "Not playing",
		PLEASE_PLAY_SONG: "Please play something",
		PLAYING_ON_APP: "Playing on",
		SCROBBLE_COUNT: "Scrobbled %COUNT% times",
		NO_LYRICS: "No lyrics available",
		NOW_PLAYING_TITLE: "\"%TITLE%\" by %ARTIST%",
		UNKNOWN_ARTIST: "Unknown artist",
		UNKNOWN_TITLE: "Unknown title",
		LYRICS_COPYRIGHT: "Lyrics provided by %PROVIDER%",
	},
	it: {
		NOT_PLAYING: "Nessuna traccia in riproduzione",
		PLEASE_PLAY_SONG: "Per favore riproduci qualcosa",
		PLAYING_ON_APP: "Riproducendo su",
		SCROBBLE_COUNT: "Riprodotto %COUNT% volte",
		NO_LYRICS: "I testi non sono disponibili",
		NOW_PLAYING_TITLE: "\"%TITLE%\" di %ARTIST%",
		UNKNOWN_ARTIST: "Artista sconosciuto",
		UNKNOWN_TITLE: "Titolo sconosciuto",
		LYRICS_COPYRIGHT: "Testi offerti da %PROVIDER%",
	},
	de: {
		NOT_PLAYING: "Kein Titel wird abgespielt",
		PLEASE_PLAY_SONG: "Bitte spiele etwas ab",
		PLAYING_ON_APP: "Weiterspielen",
		SCROBBLE_COUNT: "%COUNT% mal abgespielt",
		NO_LYRICS: "Keine Songtexte verfügbar",
		NOW_PLAYING_TITLE: "\"%TITLE%\" von %ARTIST%",
		UNKNOWN_ARTIST: "Unbekannter Künstler",
		UNKNOWN_TITLE: "Unbekannter Titel",
		LYRICS_COPYRIGHT: "Songtexte bereitgestellt von %PROVIDER%",
	},
};

export default (allLangs[config.language || navigator.language.split("-")[0]] || allLangs.en);