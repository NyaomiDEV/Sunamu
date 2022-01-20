import { EventEmitter } from "events";
import { unlink } from "fs/promises";
import { connect, createServer } from "net";
import { tmpdir } from "os";
import * as path from "path";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export default class Instance extends EventEmitter {

	private server = createServer();

	requestLock(): Promise<boolean> {
		const lockPath = path.resolve(tmpdir(), "SunamuInstance.lock");

		return new Promise(resolve => {
			this.server.on("error", (e: { code: string }) => {
				if (e.code === "EADDRINUSE") {
					this.server.close();
					const sock = connect({ path: lockPath }, () => {
						sock.write(JSON.stringify(yargs(hideBin(process.argv)).argv), () => {
							sock.destroy();
							resolve(false);
						});
					});
					sock.on("error", (e: { code: string }) => {
						if (e.code === "ECONNREFUSED")
							unlink(lockPath).then(() => resolve(this.requestLock()));
					});
				}
			});

			this.server.on("listening", () => resolve(true));

			this.server.on("connection", _sock => {
				_sock.on("data", buf => {
					this.emit("second-instance", JSON.parse(buf.toString()));
				});
			});

			this.server.listen(lockPath);
		});
	}

	releaseLock(): Promise<boolean> {
		return new Promise(resolve => {
			this.server.close(e => resolve(e ? false : true));
		});
	}
}
