async function downloadMusic(link, path) {

	const fs = require('fs-extra');
	const ytdl = require('ytdl-core');
	
	let videoID = ytdl.getURLVideoID(link);
	const res = await ytdl.getInfo(videoID, { quality: 'lowestaudio' });
	const stream = ytdl.downloadFromInfo(res, { quality: 'lowestaudio' });
	
	stream.pipe(fs.createWriteStream('hhs.mp3'));
}

downloadMusic('https://www.youtube.com/watch?v=YH18coS7c9E');