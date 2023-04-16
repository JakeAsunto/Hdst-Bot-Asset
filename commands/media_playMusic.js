module.exports.config = {
	name: 'play',
	version: '1.0.5',
	hasPermssion: 0,
	credits: 'Hadestia',
	commandCategory: 'media',
	description: 'Play a music from YouTube from the given title or YouTube link.',
	usages: '<music title or link>',
	replyUsages: '<number(index/position)>',
	cooldowns: 60,
	dependencies: {
		'fs-extra': ''
	},
	envConfig: {
		requiredArgument: 1,
		maxDownloadSize: 8388608 // 8mb
	}
}

module.exports.run = async function ({ api, event, args, returns, Utils }) {

	const { threadID, messageID, senderID } = event;
	const Innertube = require('youtubei.js');
	
	const youtube = await new Innertube();
	const { videos: result } = await youtube.search(args.join(' '));
	
	if (result.length > 0 ) {
		let msg = '', num = 0;
		const link = [];
		
		for (const item of result) {
			num += 1;
			if (num < 6) {
				link.push({
					id: item.id,
					title: item.title
				});
				msg += `${Utils.textFormat('cmd', 'cmdPlayMusicSearchResultItemFormat', num, item.title)}\n`;
			} else {
				break;
			}
		}
		
		const messageBody = Utils.textFormat('cmd', 'cmdPlayMusicSearchResultFormat', msg);
		
		return api.sendMessage(
			messageBody,
			threadID,
			(e, info) => {
				if (e) return Utils.sendRequestError(e, event, Prefix);
				Utils.sendReaction.inprocess(api, event);
				global.HADESTIA_BOT_CLIENT.handleReply.push({
					name: this.config.name,
					messageID: info.messageID,
					requestMsgID: messageID,
					author: senderID,
					results: link,
					timeout: Date.now() + 20000,
					youtube,
				});
			},
			messageID
		);
		
	} else {
		
	}
}

module.exports.handleReply = async function ({ api, event, returns, handleReply, Utils }) {

	const fs = require('fs-extra');
	const { body, threadID, messageID, senderID } = event;
	let selection = body.match(/\d+/g);
    
    if (!selection || parseInt(selection[0]) < 1 || parseInt(selection[0]) > (handleReply.results).length) {
		return returns.invalid_reply_syntax();
	}
    
    selection = Math.abs(parseInt(selection[0]));
    const pathName = `${Utils.ROOT_PATH}/cache/music-${await Utils.randomString(16)}.mp3`;

	function unlink() {
		try { fs.unlinkSync(pathName); } catch (e) {};
	}
	
    /*let timeleft = 5;
    var downloadTimer = setInterval(function(){
		if(timeleft <= 0){
			clearInterval(downloadTimer);
			api.sendMessage(Utils.textFormat('error', 'errOccured', 'File was too big.'), threadID, messageID);
		}
        timeleft -= 1;
    }, 1000);*/
    
    const youtube = handleReply.youtube;
    
    const request = handleReply.results[selection - 1];
    const stream = youtube.download(request.id, {
		format: 'mp4',
		type: 'audio',
		audioQuality: 'lowest',
		loudnessDB: '20',
		audioBitrate: '320',
		fps: '30'
	});
	
	stream.pipe(fs.createWriteStream(pathName));
	
	stream.on('start', function () {
		Utils.logger(`CMD: MUSIC: Downloading ${request.id}`, 'cache');
	});
	
	stream.on('end', function () {
		api.sendMessage(
			{ 
				body: Utils.textFormat('cmd', 'cmdPlayMusicSuccess', request.title),
				attachment: fs.createReadStream(pathName)
			},
			threadID,
			(e) => {
				if (!e) {
					Utils.sendReaction.success(api, { messageID: handleReply.requestMsgID });
					Utils.sendReaction.success(api, event);
				} else {
					Utils.sendReaction.failed(api, { messageID: handleReply.requestMsgID });
					Utils.sendReaction.failed(api, event);
				}
				unlink();
			},
			handleReply.requestMsgID
		);
		returns.delete_data();
	});
	
	stream.on('error', function () {
		
		Utils.sendReaction.failed(api, { messageID: handleReply.requestMsgID });
		Utils.sendReaction.failed(api, event);
		api.sendMessage(
			Utils.textFormat('error', 'errProcessUnable'),
			threadID,
			handleReply.requestMsgID
		);
		returns.delete_data();
		unlink();
	});
}