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
    	requiredArgument: 1
   }
}

module.exports.run = async function({ api, event, args, textFormat, Prefix }) {

	const axios = require('axios');
	const { threadID, messageID } = event;
	const { unlinkSync, createWriteStream, createReadStream } = require('fs-extra');
	
	const { Configuration, OpenAIApi } = require('openai');
	const configuration = new Configuration({ apiKey: process.env.OPENAI_API });
	const openai = new OpenAIApi(configuration);
  
	try {
		global.sendReaction.inprocess(api, event);
		const response = await openai.createImage({ prompt: args.join(' '), n: 1, size: '1024x1024' });
	
		const path = `${__dirname}/../../cache/ai-generatedImages.png`;
		const img_req = await axios.get(response.data.data[0].url, { responseType: 'arraybuffer' }).data;
		createWriteStream(img_req);
		
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
		global.logger(err, 'error');
		global.sendReaction.failed(api, event);
		global.logModuleErrorToAdmin(err, __filename, event);
		api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
}