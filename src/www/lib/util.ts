export function secondsToTime(duration: number) {
	duration = Math.floor(duration);
	let seconds = duration % 60,
		minutes = Math.floor(duration / 60) % 60;

	return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

export function fullscreen() {
	// @ts-ignore
	if (document.fullscreenElement || document.webkitFullscreenElement){
		if (document.exitFullscreen)
			document.exitFullscreen();
		// @ts-ignore
		else if (document.webkitExitFullscreen)
			// @ts-ignore
			document.webkitExitFullscreen();
	} else {
		if (document.documentElement.requestFullscreen)
			document.documentElement.requestFullscreen();
		// @ts-ignore
		else if (document.documentElement.webkitRequestFullscreen)
			// @ts-ignore
			document.documentElement.webkitRequestFullscreen();
	}
}

export function isElectron(): boolean{
	if (navigator.userAgent.toLowerCase().indexOf(" electron/") > -1) return true;
	return false;
}

export function debounce(callback: Function, time: number, leading: boolean = false, ...args: any[]): Promise<any> {
	let timer: number | undefined;
	return new Promise((resolve, reject) => {
		try{
			if (leading) {
				if (!timer)
					resolve(callback(...args));
			}

			window.clearTimeout(timer);

			timer = window.setTimeout(() => { 
				if(leading)
					timer = undefined;
				else
					resolve(callback(...args));
			}, time);
		}catch(e){
			reject(e);
		}
	});
}

export function animateScroll(element: HTMLElement, duration: number = 500) {
	if(!element) return;

	const parent = element.parentElement;
	if(!parent) return;

	let start: number;

	const begin = parent.scrollTop;
	const goal = ((element.offsetTop - parent.offsetTop) + (element.offsetHeight / 2)) - (parent.offsetHeight / 2);

	const status = {
		invalidated: false,
		completed: false
	};

	function step(timestamp: number){
		if (start === undefined){
			start = timestamp;
			parent!.style.scrollBehavior = "unset";
		}

		const elapsedTimestamp = timestamp - start;
		const elapsed = Math.min(1, elapsedTimestamp / duration);
		const easing = (t: number) => 1 + --t * t * t * t * t;
		const timed = easing(elapsed);

		const target = begin * (1 - timed) + goal * timed;

		if (elapsed >= 1 || parent!.matches(`${parent!.nodeName}:hover`) || status.invalidated) {
			parent!.style.scrollBehavior = "";
			status.completed = true;
			return;
		}

		parent!.scrollTop = target;

		window.requestAnimationFrame(step);
	}

	window.requestAnimationFrame(step);
	return status;
}