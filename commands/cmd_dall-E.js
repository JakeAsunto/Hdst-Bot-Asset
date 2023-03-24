module.exports.config = {
	name: 'dall-e',
	version: '1.0.0',
	hasPermssion: 0,
	credits: 'Hadestia',
	description: 'An AI image generator prompter from openAI',
	commandCategory: 'artificial intelligence',
	usages: '< prompt >',
	aliases: [ 'imggen' ],
	cooldowns: 10,
	dependencies: {
        'openai': '',
        'fs-extra': '',
        'axios': ''
    },
    envConfig: {
    	requiredArgument: 1,
    	inProcessReaction: true
   }
}

module.exports.run = async function({ api, event, args, returns, textFormat, Prefix }) {

	const axios = require('axios');
	const { threadID, messageID } = event;
	const { unlinkSync, writeFileSync, createReadStream } = require('fs-extra');
	
	const { Configuration, OpenAIApi } = require('openai');
	const configuration = new Configuration({ apiKey: process.env.OPENAI_API });
	const openai = new OpenAIApi(configuration);
  
	try {
		//global.sendReaction.inprocess(api, event);
		const response = await openai.createImage({ prompt: args.join(' '), n: 1, size: '1024x1024' });
	
		const path = `${__dirname}/../../cache/ai-generatedImages.png`;
		const img_req = (await axios.get(response.data.data[0].url, { responseType: 'arraybuffer' })).data;
		writeFileSync(path, Buffer.from(img_req, 'utf-8'));
		
		const messageBody = {
			body: args.join(' '),
			attachment: createReadStream(path)
		}
		
		return api.sendMessage(
			messageBody,
			threadID,
			(err) => {
				try { unlinkSync(path); } catch {}
				if (!err) return global.sendReaction.success(api, event);
			},
			messageID
		);
		
	} catch (err) {
		returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		/*if ((err.toString()).indexOf('status code 400') !== -1) {
			return api.sendMessage(textFormat('error', 'errOccured', `Inappropriate request, try another one that's valid.`), threadID, messageID);
		}*/
		
		if (err.response) {
			console.log('DALL-E STATUS', err.response.status);
            console.log('DATA', err.response.data);
			// ALL TOKENS ARE USED UP
			if (err.response.data.error.code == 'billing_hard_limit_reached') {
				api.sendMessage(textFormat('error', 'errOccured', 'Sorry, it seems like all api tokens are used up, I couldn\'t process your request. This error was already sent to the admins, kindly wait for them to recharge :)'), event.threadID, event.messageID);
				return global.logModuleErrorToAdmin(err.response.data.error.message, __filename, event);
			} else {
				api.sendMessage(textFormat('error', 'errOccured', err.response.data.error.message), event.threadID, event.messageID);
				return global.logModuleErrorToAdmin(err.response.data.error.message, __filename, event);
			}
		} else {
			global.logger(err.message, 'error');
			global.logModuleErrorToAdmin(err.message, __filename, event);
			return api.sendMessage(textFormat('error', 'errCmdExceptionError', err.message, Prefix), threadID, messageID);
		}
	}
}