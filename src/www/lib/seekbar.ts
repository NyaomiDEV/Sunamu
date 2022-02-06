import songdata from "./songdata.js";

const seekbarBg = document.getElementsByClassName("seekbar-bg")[0] as HTMLElement;
const seekbar = document.getElementById("seekbar") as HTMLElement;

seekbarBg.onclick = seekTo;

seekbarBg.onmousedown = (e) => {
	e.preventDefault();

	if(seekbarBg.classList.contains("draggable")){
		seekbarBg.onmousemove = (e) => {
			e.preventDefault();
			const rect = seekbarBg.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percentage = Math.round(x / rect.width * 100);
			seekbar.classList.add("dragging");
			seekbar.style.width = percentage + "%";
		};

		seekbarBg.onmouseup = (e) => {
			seekbarBg.onmouseup = null;
			seekbarBg.onmousemove = null;
			seekbarBg.onmouseleave = null;
			seekbar.classList.remove("dragging");
			seekTo(e);
		};

		seekbarBg.onmouseleave = () => {
			seekbarBg.onmouseup = null;
			seekbarBg.onmousemove = null;
			seekbarBg.onmouseleave = null;
			seekbar.classList.remove("dragging");
		};
	}
};

function seekTo(e) {
	const rect = seekbarBg.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const percentage = x / rect.width;
	window.np.seek(percentage);
}

export function updateSeekbarStatus() {
	if(songdata.capabilities.canSeek)
		seekbarBg.classList.add("draggable");
	else
		seekbarBg.classList.remove("draggable");
}

export function updateSeekbarTime() {
	if (!songdata.metadata.id)
		return;

	seekbarBg.style.display = (songdata.reportsPosition || (songdata.metadata.id && songdata.capabilities.canSeek)) ? "" : "none";

	const seekbarPercent = songdata.elapsed / songdata.metadata.length * 100;
	if (!seekbar.classList.contains("dragging"))
		document.getElementById("seekbar")!.style.width = `${seekbarPercent}%`;
}
