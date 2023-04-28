const ytdl = require("ytdl-core");
const fs = require("fs");
const createUUID = require("uuid").v4;
const path = require("path");

const args = process.argv.slice(2);

if (args.length < 1) {
  return;
}

const url = args[0];

console.log(`Download: ${url}`);

const ytdlStream = ytdl(url, { filter: "audioonly", format: "mp3", quality: "highestaudio" });

const fileName = `${createUUID()}.mp3`;

let speedChunkSize = 0;
let speed = 0;

const speedInterval = setInterval(() => {
  speed = speedChunkSize / (1024 * 1024);
  speedChunkSize = 0;
}, 500);

ytdlStream.on("progress", (chunkSize, downloadSize, totalSize) => {
  speedChunkSize += chunkSize;
  const progressSize = 20;

  const floorProgress = Math.floor((downloadSize / totalSize) * progressSize);

  const progressBar = "#".repeat(floorProgress) + ".".repeat(progressSize - floorProgress);
  process.stdout.write(`\r[${progressBar}] ${((downloadSize / totalSize) * 100).toFixed(2)}% ${speed.toFixed(2)} MB/s`);
});
ytdlStream.on("end", () => {
  clearInterval(speedInterval);
  console.log();
  console.log(`File saved: ${path.join(process.cwd(), fileName)}`);
});
ytdlStream.pipe(fs.createWriteStream(fileName));
