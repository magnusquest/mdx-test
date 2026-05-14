import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");

function ensureLogDir() {
	if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function logLlmOutput(text: string) {
	ensureLogDir();
	const timestamp = new Date().toISOString();
	const entry = `[${timestamp}]\n${text}\n${"─".repeat(80)}\n`;
	fs.appendFileSync(path.join(LOG_DIR, "llm-output.log"), entry, "utf8");
}
