export function secondsToTime(duration) {
	duration = Math.floor(duration);
	let seconds = duration % 60,
		minutes = Math.floor(duration / 60) % 60;

	return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

export function fullscreen() {
	if (document.fullscreenElement != null)
		document.webkitExitFullscreen();
	else
		document.documentElement.webkitRequestFullscreen();
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

export function toggleLyricsView(){
	if(document.getElementsByClassName("metadata")[0].style.display === "none"){
		document.getElementsByClassName("metadata")[0].style.display = "";
		document.getElementsByClassName("lyrics")[0].style.display = "none";
		document.getElementsByClassName("lyrics-footer")[0].style.display = "none";

		window.onresize = null;
	}else{
		document.getElementsByClassName("metadata")[0].style.display = "none";
		document.getElementsByClassName("lyrics")[0].style.display = "";
		document.getElementsByClassName("lyrics-footer")[0].style.display = "";

		reCenter();
		window.onresize = () => reCenter();
	}
}
