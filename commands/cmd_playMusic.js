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
	//disabled: true
}

module.exports.handleReply = async function ({ api, event, returns, handleReply, Utils }) {
	
    const axios = require('axios');
    const { body, threadID, messageID, senderID } = event;
    const { createReadStream, unlinkSync, statSync } = require("fs-extra");
    let selection = body.match(/\d+/g);
    
    if (!selection || Math.abs(parseInt(selection[0])) < 1 || Math.abs(parseInt(selection[0])) > (handleReply.results).length) return returns.invalid_reply_syntax();
    
    selection = Math.abs(parseInt(selection[0]));
    
    try {
    	
    	const directory = `${__dirname}/../../cache/`;
        const path = `${directory}musicRequest-of-${senderID}.mp3`;
        var data = await downloadMusicFromYoutube('https://www.youtube.com/watch?v=' + handleReply.results[selection - 1], path);
        
        if (statSync(path).size > 6291456) {
        	try { unlinkSync(path); } catch (_) {}
			Utils.sendReaction.failed(api, event);
			api.sendMessage(Utils.textFormat('cmd', 'cmdPlayMusicFileWasBig', 6), threadID, messageID);
			return returns.delete_data();
		}
        
        api.sendMessage(
			{ 
				body: Utils.textFormat('cmd', 'cmdPlayMusicSuccess', data.title),
				attachment: createReadStream(path)
			},
			threadID,
			(e) => { if (!e) {
				// set reaction for the request
				Utils.sendReaction.success(api, { messageID: handleReply.requestMsgID });
				// Also for the selection
				Utils.sendReaction.success(api, event);
			} try { return unlinkSync(path) } catch {} },
			handleReply.requestMsgID
		);
		return returns.delete_data();
    }
    catch (e) {
		console.log(e);
    	Utils.sendReaction.failed(api, { messageID: handleReply.requestMsgID });
		Utils.logModuleErrorToAdmin(e, __filename, event);
		return api.sendMessage(global.textFormat('error', 'errCmdExceptionError', e, global.HADESTIA_BOT_CONFIG.PREFIX), threadID, messageID);
    }
}

module.exports.run = async function ({ api, args, event, Utils, Prefix }) {
	
	const { threadID, messageID, senderID } = event;
	const axios = require("axios");
    const fs = require("fs-extra");
	
	const song = args.join(' ');
	const directory = `${__dirname}/../../cache/`;
	
	Utils.sendReaction.custom(api, event, '🔍');
	// handle search via link
	if (song.indexOf('https://') !== -1) {
		try {
			const path = `${directory}musicRequest-of-${senderID}.mp3`;
			const data = await downloadMusicFromYoutube(song, path);
			// if request was larger than 8mb
			if (fs.statSync(path).size > 8388608) {
				Utils.sendReaction.failed(api, event);
				return api.sendMessage(Utils.textFormat('cmd', 'cmdPlayMusicFileWasBig', 8), threadID, () => fs.unlinkSync(path), messageID);
			}
					
			return api.sendMessage(
				{ 
					body: Utils.textFormat('cmd', 'cmdPlayMusicSuccess', data.title),
					attachment: fs.createReadStream(path)
				},
				threadID,
				(e) => { if (!i) {
					Utils.sendReaction.success(api, event);
					return fs.unlinkSync(path);
				} },
				messageID
			);
					
		} catch (err_link_req) {
			console.log(err_link_req);
			Utils.sendReaction.success(api, event);
			Utils.sendRequestError(err_link_req, event, Prefix);
			return Utils.logModuleErrorToAdmin(err_link_req, __filename, event);
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
			msg += `${Utils.textFormat('cmd', 'cmdPlayMusicSearchResultItemFormat', num, value.title)}\n`;
		}
				
		const messageBody = textFormat('cmd', 'cmdPlayMusicSearchResultFormat', msg);
				
		return api.sendMessage(
			messageBody,
			threadID,
			(e, info) => {
				if (e) return Utils.sendRequestError(e, event, Prefix);
				Utils.sendReaction.inprocess(api, event);
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
		Utils.sendReaction.failed(api, event);
		Utils.sendRequestError(api_second_error_manual_search, event, Prefix)
		return Utils.logModuleErrorToAdmin(api_second_error_manual_search, __filename, event);
	}
}

async function downloadMusicFromYoutube(link, path) {

	const fs = require('fs-extra');
	const ytdl = require('ytdl-core');
	const { resolve } = require('path');
	
	if (!link) return 'No link given';
	
	const returnPromise = new Promise(function (resolve, reject) {
		try {
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
            
            		resolve(result);
      	 	 });
		} catch(err) {
			reject(err);
		}
	});
        
  return returnPromise;
}