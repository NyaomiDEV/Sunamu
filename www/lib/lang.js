export const allLangs = {
	en: {
		NOT_PLAYING: "Not playing",
		PLEASE_PLAY_SONG: "Please play something",
		PLAYING_ON_APP: "Playing on %APP%"
	}
};

export default (allLangs[navigator.language.split("-")[0]] || allLangs.en);