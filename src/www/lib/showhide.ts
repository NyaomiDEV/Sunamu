export function hide() {
	if (document.documentElement.classList.contains("static") && !document.documentElement.classList.contains("force-idle"))
		return;

	document.documentElement.classList.add("idle");
}

export function show() {
	if (document.documentElement.classList.contains("static") && document.documentElement.classList.contains("force-idle"))
		return;

	document.documentElement.classList.remove("idle");
}
