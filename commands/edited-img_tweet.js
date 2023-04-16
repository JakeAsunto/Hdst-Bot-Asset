module.exports.config = {
	name: 'tweet',
	version: '1.0.2',
	hasPermssion: 0,
	credits: 'Joshua Sy',
	description: 'tweet',
	commandCategory: 'edited_images',
	usages: '<text>',
	cooldowns: 10,
	dependencies: {
		'fs-extra': '',
		'canvas': '',
		'axios': '',
		'jimp': ''
	},
	envConfig: {
		requiredArgument: 1
	}
};

module.exports.circle = async (image) => {
	
    const jimp = require('jimp');
	image = await jimp.read(image);
	image.circle();
	return await image.getBufferAsync('image/png');
}

module.exports.wrapText = (ctx, text, maxWidth) => {
	
	return new Promise(resolve => {
		if (ctx.measureText(text).width < maxWidth) return resolve([text]);
		if (ctx.measureText('W').width > maxWidth) return resolve(null);
		const words = text.split(' ');
		const lines = [];
		let line = '';
		while (words.length > 0) {
			let split = false;
			while (ctx.measureText(words[0]).width >= maxWidth) {
				const temp = words[0];
				words[0] = temp.slice(0, -1);
				if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
				else {
					split = true;
					words.splice(1, 0, temp.slice(-1));
				}
			}
			if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
			else {
				lines.push(line.trim());
				line = '';
			}
			if (words.length === 0) lines.push(line.trim());
		}
		return resolve(lines);
	});
	
} 

module.exports.run = async function({ api, event, args, Users, Utils }) {
	
	let {threadID, senderID, messageID} = event;
	const res = await api.getUserInfoV2(senderID); 
	const { loadImage, createCanvas } = require('canvas');
	const fs = require('fs-extra');
	const axios = require('axios')
	
	Utils.sendReaction.inprocess(api, event);
	
	let avatar = `${Utils.ROOT_PATH}/cache/tweet-avt${senderID}.png`;
	let pathImg = `${Utils.ROOT_PATH}/cache/tweet-${senderID}.png';
	var text = args.join(' ');
	
	let getAvatar = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=1290&height=1290&access_token=${process.env.FB_ACCESS_TOKEN}`, { responseType: 'arraybuffer' })).data;
	let getTweet = (await axios.get(`https://i.imgur.com/dMiKIXM.png`, { responseType: 'arraybuffer' })).data;
	
	fs.writeFileSync(avatar, Buffer.from(getAvatar, 'utf-8'));
	oms = await this.circle(avatar);
	fs.writeFileSync(pathImg, Buffer.from(getTweet, 'utf-8'));
	
	let image = await loadImage(oms);
	let baseImage = await loadImage(pathImg);
	let canvas = createCanvas(baseImage.width, baseImage.height);
	let ctx = canvas.getContext('2d');
	
	ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
	ctx.drawImage(image, 53, 35, 85, 85);
	ctx.font = '700 23px Arial';
	ctx.fillStyle = '#000000';
	ctx.textAlign = 'start';
	ctx.fillText(res.name, 160, 70);
    ctx.font = '400 16px Arial';
	ctx.fillStyle = '#BBC0C0';
	ctx.textAlign = 'start';
	ctx.fillText(`@${res.name}`, 153, 99);
	ctx.font = '400 45px Arial';
	ctx.fillStyle = '#000000';
	ctx.textAlign = 'start';
	
	let fontSize = 250;
	while (ctx.measureText(text).width > 2600) {
		fontSize--;
		ctx.font = `500 ${fontSize}px Arial`;
	}
	
	const lines = await this.wrapText(ctx, text, 850);
	
	ctx.fillText(lines.join('\n'), 56, 180);
	ctx.beginPath();
	
	const imageBuffer = canvas.toBuffer();
	
	fs.writeFileSync(pathImg, imageBuffer);
	fs.removeSync(avatar);
	
	return api.sendMessage(
		{ attachment: fs.createReadStream(pathImg) },
		threadID,
		(e) => {
			fs.unlinkSync(pathImg);
			if (!e) {
				return Utils.sendReaction.success(api, event);
			}
			return Utils.sendReaction.failed(api, event);
		},
		messageID
	);
}