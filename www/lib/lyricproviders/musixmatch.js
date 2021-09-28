import songdata from "../songdata.js";

const musixmatch = "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&subtitle_format=mxm&app_id=web-desktop-app-v1.0";

export async function query() {
	if (!window.localStorage.mxmusertoken)
		return undefined;

	const reply = {
		provider: "Musixmatch",
		synchronized: true,
		copyright: undefined,
		lines: []
	};

	const params = {
		q_artist: songdata.metadata.artist,
		q_artists: songdata.metadata.artist,
		q_track: songdata.metadata.title,
		q_album: songdata.metadata.album,
		usertoken: window.localStorage.mxmusertoken
	};

	const headers = new Headers({
		"Cookie": "x-mxm-user-id=",
		"Authority": "apic-desktop.musixmatch.com"
	});
	const request = new Request(
		musixmatch + "&" + Object.keys(params).map(key => key + "=" + encodeURIComponent(params[key])).join("&"),
		{ headers }
	);

	let result;
	try {
		result = await (await fetch(request)).json();
	} catch (e) {
		console.error("Musixmatch request got an error!", e);
		result = {};
	}

	console.log(result);

	const synchronizedLyrics = result?.message?.body?.macro_calls?.["track.subtitles.get"]?.message?.body?.subtitle_list?.[0]?.subtitle?.subtitle_body;
	//const synchronizedLyrics = undefined;
	const unsynchronizedLyrics = result?.message?.body?.macro_calls?.["track.lyrics.get"]?.message?.body?.lyrics?.lyrics_body;

	if(synchronizedLyrics){
		reply.lines = JSON.parse(synchronizedLyrics).map(v => ({ text: v.text, time: v.time.total }));
		reply.copyright = result?.message?.body?.macro_calls?.["track.subtitles.get"]?.message?.body?.subtitle_list?.[0]?.subtitle?.lyrics_copyright?.trim().split("\n").join(" • ");
	}
	else if(unsynchronizedLyrics) {
		reply.synchronized = false;
		reply.lines = unsynchronizedLyrics.split("\n").map(x => ({text: x}));
		reply.copyright = result?.message?.body?.macro_calls?.["track.lyrics.get"]?.message?.body?.lyrics?.lyrics_copyright?.trim().split("\n").join(" • ");
	} else {
		console.error("Musixmatch request didn't get us any lyrics!", result?.message?.header);
		return undefined;
	}

	return reply;
}