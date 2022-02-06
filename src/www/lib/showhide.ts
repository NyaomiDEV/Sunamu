export function hide() {
	if (document.documentElement.classList.contains("static"))
		return;

	document.documentElement.classList.add("idle");
}

export function show() {
	document.documentElement.classList.remove("idle");
}
