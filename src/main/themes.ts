import { stat } from "fs/promises";
import { resolve } from "path";
import { getAppData } from "./util";

const themeDirectory = resolve(getAppData(), "sunamu", "themes");

export function getThemeLocation(theme: string){
	const probablePath = resolve(themeDirectory, theme, "style.css");
	try{
		stat(probablePath);
		return probablePath;
	}catch(_){
		return undefined;
	}
}

export function getThemesDirectory(){
	return themeDirectory;
}