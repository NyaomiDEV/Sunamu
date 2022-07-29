import config from "../config.js";

async function importLanguage(name: string){
	try {
		return (await import("./" + name + ".js")).default;
	} catch (e) {
		console.error("Unknown language", name);
		return undefined;
	}
}

export default (
	await importLanguage(config.language) ||
	await importLanguage(navigator.language.split("-")[0]) ||
	await importLanguage("en")
);
