import songdata from "./songdata.js";

function normalizeAppName(): string{
	let app = songdata.app;
	if(songdata.provider === "MPRIS2"){
		app = app.replace("org.mpris.MediaPlayer2.", "");
		if(app === "plasma-browser-integration")
			app = songdata.appName.toLowerCase(); // plasma whyyyyyy

		app = app.replace(/\.instance[0-9]+$/, ""); // chromium.instance12345, firefox.instance12345
	}

	switch(app){
		// BROWSERS
		case "chrome":
		case "chromium":
		case "Chrome.exe":
		case "Chromium.exe":
			return "chrome";
		case "firefox":
		case "Firefox.exe":
			return "firefox";
		case "librewolf":
		case "LibreWolf.exe":
			return "librewolf";
		case "MSEdge.exe":
			return "msedge";
		case "opera":
		case "operagx": // TODO: check if correct
		case "Opera.exe":
		case "OperaGX.exe": // TODO: check if correct
			return "opera";
		case "vivaldi":
		case "Vivaldi.exe":
			return "vivaldi";
		// MUSIC PLAYERS
		case "AIMP.exe":
			return "aimp";
		case "amarok":
			return "amarok";
		case "clementine":
		case "Clementine.exe":
			return "clementine";
		case "elisa":
			return "elisa";
		case "foobar2000.exe":
			return "foobar2000";
		case "org.gnome.Music":
			return "gnome-music";
		case "Lollypop":
			return "lollypop";
		case "MusicBee.exe":
			return "musicbee";
		case "io.github.Pithos":
			return "pithos";
		case "qmmp":
			return "qmmp";
		case "rhythmbox":
			return "rhythmbox";
		case "Sonixd":
		case "Sonixd.exe":
		case "org.erb.sonixd":
			return "sonixd";
		case "spotify":
		case "spotifyd":
		case "spotify-qt":
		case "Spot":
		case "Spotify.exe":
		case "SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify":
			return "spotify";
		case "strawberry":
		case "Strawberry.exe":
			return "strawberry";
		case "tauon":
			return "tauon";
		// MEDIA (MUSIC BUT ALSO VIDEO ETC) PLAYERS
		case "Microsoft.ZuneMusic_8wekyb3d8bbwe!Microsoft.ZuneMusic":
			return "groove";
		case "mpv":
			return "mpv";
		case "vlc":
		case "VideoLAN.VLC_paz6r1rewnh0a!App":
			return "vlc";
	}

	return "default";
}

export function getAppIcon(){
	// Traversing to the root and back because WebKit
	return "../../../../assets/images/apps/" + normalizeAppName() + ".svg";
}