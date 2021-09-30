export function debug(...args: any) {
	if (process.env.DEBUG)
		console.log(...args);
}