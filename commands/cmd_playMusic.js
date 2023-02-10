module.exports.config = {
	name: 'play',
	version: '1.0.5',
	hasPermssion: 0,
	credits: 'Hadestia',
	commandCategory: 'media',
	description: 'Play a music from YouTube from the given title. or YouTube link',
	usages: '<music title or link >',
	replyUsages: '< number(index/position) >',
	cooldowns: 60,
	dependencies: {
		'axios': '',
		'fs-extra': '',
		'request': ''
	},
	envConfig: {
		requiredArgument: 1
	}
	// disabled: true
}

module.exports.handleReply = async function ({ api, event, returns, handleReply }) {
	
    const axios = require('axios');
    const { body, threadID, messageID, senderID } = event;
    const { createReadStream, unlinkSync, statSync } = require("fs-extra");
    let selection = parseInt(body.split(' ')[0]);
    
    if (!selection || selection < 1 || selection > handleReply.results.length) return returns.invalid_reply_syntax();
    
    try {
    	
    	const directory = `${__dirname}/../../cache/`;
        const path = `${directory}musicRequest-of-${senderID}.mp3`;
        var data = await downloadMusicFromYoutube('https://www.youtube.com/watch?v=' + handleReply.results[selection - 1], path);
        if (statSync(path).size > 6291456) {
			global.sendReaction.failed(api, event);
			api.sendMessage(textFormat('cmd', 'cmdPlayMusicFileWasBig', 6), threadID, () => unlinkSync(path), messageID);
			return returns.delete_data();
		}
        
        api.sendMessage(
			{ 
				body: global.textFormat('cmd', 'cmdPlayMusicSuccess', data.title),
				attachment: createReadStream(path)
			},
			threadID,
			(e) => { if (!e) {
				// set reaction for the request
				global.sendReaction.success(api, { messageID: handleReply.requestMsgID });
				// Also for the selection
				global.sendReaction.success(api, event);
				return unlinkSync(path);
			} },
			messageID
		);
		return returns.delete_data();
    }
    catch (e) {
		console.log(e);
    	global.sendReaction.failed(api, event);
		global.logModuleErrorToAdmin(e, __filename, threadID, senderID);
		return api.sendMessage(global.textFormat('error', 'errCmdExceptionError', e, global.config.PREFIX), threadID, messageID);
    }
}

module.exports.run = async function ({ api, args, event, logger, textFormat }) {
	
	const { threadID, messageID, senderID } = event;
	const axios = require("axios");
    const fs = require("fs-extra");
    const request = require("request");
	
	const song = args.join(' ');
	const directory = `${__dirname}/../../cache/`;
	
	try {
		const maxSize = 8.0;

		// transfer handle to the second api if requested via link
		if (song.indexOf('https://') !== -1) {
			throw 'SEARCH_VIA_LINK';
		}
		
    	// ctto: SaikiDesu
		const Innertube = require("youtubei.js");
    	const youtube = await new Innertube();
    	const search = await youtube.search(song);
    
    	if (search.videos[0] === undefined) {
    	
			api.sendMessage(textFormat('cmd', 'cmdPlayMusicInvalidReq'), threadID, messageID);
			global.sendReaction.failed(api, event);
	
		} else {
    	
			// api.sendMessage(textFormat('cmd', 'cmdPlayMusicSearching', song), threadID,() => global.autoUnsend(2), messageID);
			global.sendReaction.custom(api, event, '🔍');
    
			var timeleft = 5;
			// ensure that title has no spacing
			let songraw = (search.videos[0].title).split(' ');
			const songTitle = songraw.join('_');
			const path = `${directory}${songTitle}.mp3`;
		
			const stream = youtube.download(search.videos[0].id, {
				format: 'mp4',
				type: 'audio',
				audioQuality: 'lowest',
				loudnessDB: '20',
				audioBitrate: '320',
				fps: '30'
			});
		
			//global.sendReaction.inprocess(api, event);
		
			stream.pipe(fs.createWriteStream(path));
			stream.on('progress', (info) => {
        		// unprocess if file was big
				if (parseFloat(info.size) > maxSize) {
					stream.cancel();
					if (fs.existsSync(path)) {
						fs.unlink(path, function (err) {});
					}
					logger('Download was cancelled due to big file size', 'cache');
					api.sendMessage(textFormat('cmd', 'cmdPlayMusicFileWasBig', maxSize), threadID, messageID);
					global.sendReaction.failed(api, event);
				}
        	});


			//stream.on('start', () => { console.info('[DOWNLOADER]', 'Starting download now!'); }); 
			stream.on('info', (info) => {
				logger(`PlayMusic.js: downloading ${info.video_details.title} by ${info.video_details.metadata.channel_name}`, 'cache');
				//console.info('[DOWNLOADER]',`Downloading ${info.video_details.title} by ${info.video_details.metadata.channel_name}`);
				//console.log(info);
			});

  
			stream.on('end', async () => {
				//console.info(`[DOWNLOADER] Downloaded`);
				logger('PlayMusic.js: File downloaded, sending message...', 'cache');
				const message = {
					body: textFormat('cmd', 'cmdPlayMusicSuccess', search.videos[0].title),
					attachment:[ fs.createReadStream(path)]
				};
			
				api.sendMessage(
					message,
					threadID,
					async (err, info) => {
						if (err) {
							return api.sendMessage(textFormat('error', 'errProcessUnable'), threadID, messageID);
						}
						if (info) {
							global.sendReaction.success(api, event);
							if (fs.existsSync(path)) {
								fs.unlink(path, function (err) {
									if (err) return console.log(err);                                        
							    	logger(`File was sent & ${path} was deleted!`, 'cache');
								});
							}
						}
					},
					messageID
				);
			
			
			});
   
			stream.on('error', (err) => {
				console.log(err.type);
				if (err.type === 'DOWNLOAD_CANCELLED') {
					return api.sendMessage(textFormat('cmd', 'cmdPlayMusicFileWasBig', 6), threadID, () => fs.unlinkSync(path), messageID);
				}
				//logger(`Unable to process request for song '${song}', skipping..`, 'cache');
				return api.sendMessage(`Unable to process request for song '${song}'`, threadID, messageID);
			});
		}
	} catch (api_one_err) {
		if (api_one_err !== 'SEARCH_VIA_LINK') {
			console.log(api_one_err);
			global.logModuleErrorToAdmin(api_one_err, __filename, threadID, senderID);
		}
		// if first api failed try in second api
		global.sendReaction.custom(api, event, '🔍');
		
		try {
			const path = `${directory}musicRequest-of-${senderID}.mp3`;
			if (fs.existsSync(path)) {
				fs.unlinkSync(path)
			}
			
			if (api_one_err && api_one_err === 'SEARCH_VIA_LINK') {
				try {
					
					const data = await downloadMusicFromYoutube(song, path);
					
					if (fs.statSync(path).size > 6291456) {
						global.sendReaction.failed(api, event);
						return api.sendMessage(textFormat('cmd', 'cmdPlayMusicFileWasBig', 6), threadID, () => fs.unlinkSync(path), messageID);
					}
					
					return api.sendMessage(
						{ 
							body: textFormat('cmd', 'cmdPlayMusicSuccess', data.title),
							attachment: fs.createReadStream(path)
						},
						threadID,
						(e) => { if (!i) {
							global.sendReaction.success(api, event);
							return fs.unlinkSync(path);
						} },
						messageID
					)
					
				} catch (err_link_req) {
					console.log(err_link_req);
					global.sendReaction.success(api, event);
					global.logModuleErrorToAdmin(err_link_req, __filename, threadID, senderID);
					return api.sendMessage(textFormat('error', 'errCmdExceptionError', err_link_req, global.config.PREFIX), threadID, messageID);
				}
				return;
			}
			
			// handle via search manually
			try {
				const link = [];
				let msg = '', num = 0;

				const Youtube = require('youtube-search-api');
				const data = (await Youtube.GetListByKeyword(song, false, 6)).items;
				
				for (const value of data) {
					link.push(value.id);
					num += 1;
					msg += `${textFormat('cmd', 'cmdPlayMusicSearchResultItemFormat', num, value.title)}\n`;
				}
				
				const messageBody = textFormat('cmd', 'cmdPlayMusicSearchResultFormat', msg);
				
				return api.sendMessage(
					messageBody,
					threadID,
					(e, info) => {
						if (e) return api.sendMessage(textFormat('error', 'errCmdExceptionError', e, global.config.PREFIX), threadID, messageID);
						global.sendReaction.inprocess(api, event);
						global.client.handleReply.push({
							name: this.config.name,
							messageID: info.messageID,
							requestMsgID: messageID,
							author: senderID,
							results: link,
							timeout: Date.now() + 20000
						});
					},
					messageID
				);
			} catch (api_second_error_manual_search) {
				console.log(api_second_error_manual_search)
				global.sendReaction.failed(api, event);
				global.logModuleErrorToAdmin(api_second_error_manual_search, __filename, threadID, senderID);
				return api.sendMessage(textFormat('error', 'errCmdExceptionError', api_second_error_manual_search, global.config.PREFIX), threadID, messageID);
			}
		} catch (api_second_err) {
			console.log(api_second_err);
			global.sendReaction.failed(api, event);
			global.logModuleErrorToAdmin(api_second_err, __filename, threadID, senderID);
			return api.sendMessage(textFormat('error', 'errCmdExceptionError', api_second_err, global.config.PREFIX), threadID, messageID);
		}
	}
}

async function downloadMusicFromYoutube(link, path) {

	const fs = require('fs-extra');
	const ytdl = require('ytdl-core');
	const { resolve } = require('path');
	
	if (!link) return 'No link given';
	
	let resolveFunc = function () { };
	let rejectFunc = function () { };
	
	const returnPromise = new Promise(function (resolve, reject) {
		resolveFunc = resolve;
		rejectFunc = reject;
	});
	
    ytdl( link, { filter: format => format.quality == 'tiny' && format.audioBitrate == 48 && format.hasAudio == true }).pipe(fs.createWriteStream(path))
		.on("close", async () => {
			
            const data = await ytdl.getInfo(link);
            
            let result = {
                title: data.videoDetails.title,
                dur: Number(data.videoDetails.lengthSeconds),
                viewCount: data.videoDetails.viewCount,
                likes: data.videoDetails.likes,
                author: data.videoDetails.author.name
            }
            
            resolveFunc(result);
        });
        
  return returnPromise
}