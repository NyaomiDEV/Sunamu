import lang from "./lang.js";
import songdata from "./songdata.js";

const container = document.getElementsByClassName("lyrics")[0];

export async function queryLyrics(){
	if (!window.localStorage.mxmusertoken) return;
	const musixmatch = "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&subtitle_format=mxm&app_id=web-desktop-app-v1.0";

	const params = {
		q_artist: songdata.metadata.artist,
		q_artists: songdata.metadata.artist,
		q_track: songdata.metadata.title,
		//q_album: songdata.metadata.album,
		usertoken: window.localStorage.mxmusertoken
	};

	const headers = new Headers({
		"Cookie": "x-mxm-user-id=",
		"Authority": "apic-desktop.musixmatch.com"
	});
	const request = new Request(
		musixmatch + "&" + Object.keys(params).map(key => key + "=" + encodeURIComponent(params[key])).join("&"),
		{headers}
	);

	let result;
	try{
		result = await (await fetch(request)).json();
	}catch(e){
		console.error("Musixmatch request got an error!", e);
		result = {};
	}

	const lyrics = JSON.parse(result?.message?.body?.macro_calls?.["track.subtitles.get"]?.message?.body?.subtitle_list?.[0]?.subtitle.subtitle_body || "[]")
		.map(v => ({ text: v.text, time: v.time.total }));

	if(lyrics.length) songdata.lyrics = lyrics;
	else{
		console.error("Musixmatch request didn't get us any lyrics!", result?.message?.header);
		songdata.lyrics = undefined;
	}
}

export function putLyricsInPlace(){
	// remove all children of container
	while (container.firstChild) container.removeChild(container.lastChild);

	// start checking for no lyrics
	if(!songdata.lyrics){
		const noLyrics = document.createElement("span");
		noLyrics.classList.add("line");
		if (!window.localStorage.mxmusertoken)
			noLyrics.textContent = lang.NO_MXM_TOKEN;
		else
			noLyrics.textContent = lang.NO_LYRICS;
		container.appendChild(noLyrics);
		noLyrics.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "smooth"
		});
		return;
	}

	// we are good with lyrics so we push them all
	for(const line of songdata.lyrics){
		const elem = document.createElement("span");
		elem.classList.add("line");
		elem.textContent = line.text;
		container.appendChild(elem);
	}
}

export function updateActiveLyrics(){
	if (!songdata.lyrics) return;
	// we get the active one
	let lineIndex = songdata.lyrics.length - 1;
	for(let i = 0; i < songdata.lyrics.length; i++){
		if(songdata.elapsed < songdata.lyrics[i+1]?.time){
			lineIndex = i;
			break;
		}
	}

	// now we iterate through the container to unset previous active stuff
	const wasActiveBefore = container.children[lineIndex]?.classList?.contains("active");

	for(let i = 0; i < container.children.length; i++){
		if(i === lineIndex)
			container.children[i].classList?.add("active");
		else
			container.children[i].classList?.remove("active");
	}

	// now we bring the active into view
	if(!wasActiveBefore){
		container.children[lineIndex]?.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "smooth"
		});
	}
}