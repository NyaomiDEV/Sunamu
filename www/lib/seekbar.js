import songdata from "./songdata.js";

const seekbarBg = document.getElementsByClassName("seekbar-bg")[0];
const seekbar = document.getElementById("seekbar");

seekbarBg.onclick = seekTo;

seekbarBg.onmousedown = (e) => {
	e.preventDefault();
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
		seekbar.classList.remove("dragging");
		seekTo(e);
	};
};

function seekTo(e) {
	const rect = seekbarBg.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const percentage = x / rect.width;
	window.np.seek(percentage);
}

export function updateSeekbar() {
	const seekbarPercent = songdata.elapsed / songdata.metadata.length * 100;
	const seekbar = document.getElementById("seekbar");
	if (!seekbar.classList.contains("dragging"))
		document.getElementById("seekbar").style.width = `${seekbarPercent}%`;
}
