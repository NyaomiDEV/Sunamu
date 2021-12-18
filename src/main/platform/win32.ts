import { BrowserWindow } from "electron";

// @ts-ignore
import { SetWindowPosition, HWND_BOTTOM, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE } from "windowtoolbox";

export function sendOnBottom(win: BrowserWindow){
	const hWnd = win.getNativeWindowHandle();
	return SetWindowPosition(hWnd, Buffer.from([HWND_BOTTOM]), 0, 0, 0, 0, SWP_NOACTIVATE | SWP_NOSIZE | SWP_NOMOVE);
}