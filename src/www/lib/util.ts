export function secondsToTime(duration: number) {
	duration = Math.floor(duration);
	let seconds = duration % 60,
		minutes = Math.floor(duration / 60) % 60;

	return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

export function fullscreen() {
	if (document.fullscreenElement != null)
		// @ts-ignore
		document.exitFullscreen() || document.webkitExitFullscreen();
	else
		// @ts-ignore
		document.documentElement.requestFullscreen() || document.documentElement.webkitRequestFullscreen();
}

function reCenter() {
	if (document.getElementsByClassName("lyrics")[0].children.length === 1) {
		// assuming we only have one child so it is the no lyrics child
		document.getElementsByClassName("lyrics")[0].children[0].scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "auto"
		});
	} else {
		// we do have lyrics so we scroll to the active one
		document.getElementsByClassName("line active")[0]?.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "auto"
		});
	}
}

export function toggleLyricsView(show?: boolean){
	if (document.documentElement.classList.contains("no-lyrics"))
		return;

	if (typeof show === "undefined")
		show = document.getElementsByClassName("lyrics")[0].classList.contains("hidden");

	if(show){
		document.getElementsByClassName("metadata")[0].classList.add("hidden");
		document.getElementsByClassName("lyrics")[0].classList.remove("hidden");
		document.getElementsByClassName("lyrics-footer")[0].classList.remove("hidden");

		reCenter();
		window.onresize = () => reCenter();
	}else{
		document.getElementsByClassName("metadata")[0].classList.remove("hidden");
		document.getElementsByClassName("lyrics")[0].classList.add("hidden");
		document.getElementsByClassName("lyrics-footer")[0].classList.add("hidden");

		window.onresize = null;
	}
}

export function isElectron(): boolean{
	if (navigator.userAgent.toLowerCase().indexOf(" electron/") > -1) return true;
	return false;
}