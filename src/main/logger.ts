import { basename } from "path";
import { inspect } from "util";
import { debugMode } from "./appStatus";

function getStack(caller: Function) {
	const _handler = Error.prepareStackTrace;
	Error.prepareStackTrace = (_a, b) => b;
	const resultHolder: any = {};
	Error.captureStackTrace(resultHolder, caller);
	// eslint-disable-next-line no-undef
	const stack: NodeJS.CallSite[] = resultHolder.stack;
	Error.prepareStackTrace = _handler;

	const parsedStack: any[] = [];
	for(const callSite of stack){
		parsedStack.push({
			function: callSite.getFunctionName(),
			method: callSite.getMethodName(),
			file: callSite.getFileName(),
			line: callSite.getLineNumber(),
			column: callSite.getColumnNumber(),
			// @ts-ignore this does exist, wtf typedefs
			async: callSite.isAsync()
		});
	}
	return parsedStack;
}

export function logToDebug(...args: any[]) {
	if (debugMode){
		let shiftStack = 0;
		if(args.length && typeof args[0] === "number")
			shiftStack = args.shift();

		const callSite = getStack(logToDebug)[shiftStack];
		let debugString = "[idkwhere]";
		if(callSite)
			debugString = `[${basename(callSite.file)}:${callSite.function || callSite.method || "!anonymous"}:${callSite.line}:${callSite.column}]`;
		
		for(const i in args){
			if(typeof args[i] !== "string")
				args[i] = inspect(args[i], undefined, undefined, true);
		}

		console.log(debugString, ...args);
	}
}