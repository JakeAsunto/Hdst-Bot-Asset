module.exports.config = {
	name: 'ai',
	version: '2.0.10',
	hasPermssion: 0,
	credits: 'Hadestia',
	description: 'a ChatGPT3 base AI.',
	commandCategory: 'artificial intelligence',
	usages: '< prompt (that is not a single word) >',
	aliases: [ 'openai', 'aoi' ],
	cooldowns: 300,
	dependencies: {
        'openai': ''
    },
    envConfig: {
    	requiredArgument: 1,
    	inProcessReaction: true
   }
}

module.exports.run = async function({ api, event, args, textFormat }) {

	const { Configuration, OpenAIApi } = require('openai');
	const configuration = new Configuration({ apiKey: process.env.OPENAI_API });
  
	const openai = new OpenAIApi(configuration);

	try {
		//global.sendReaction.inprocess(api, event);
		const completion = await openai.createCompletion({
        	model: 'text-davinci-003',
            prompt: `User: ${args.join(' ')}\n${global.config.BOTNAME}: `,
            temperature: 0,
            max_tokens: 250,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
        });
        
		api.sendMessage(
			completion.data.choices[0].text,
			event.threadID,
			(err) => {
				if (err) return global.sendReaction.failed(api, event);;
				global.sendReaction.success(api, event);
			},
			event.messageID
		);
	} catch (error) {
		//console.log('ALL', error);
		if (error.response) {
        	console.log('OPENAI STATUS', error.response.status);
            console.log('DATA', error.response.data);
			// ALL TOKENS ARE USED UP
			if (error.response.status == 429) {
				api.sendMessage(textFormat('error', 'errOccured', 'Sorry, it seems like all api tokens are used up, I couldn\'t process your request. This error was already sent to the admins, kindly wait for them to recharge :)'), event.threadID, event.messageID);
				global.logModuleErrorToAdmin(error.response.data.error.message, __filename, event);
			}
        } else {
        	console.log('MESSAGE', error.message);
        	global.sendReaction.failed(api, event);
        	global.logModuleErrorToAdmin(error, __filename, event);
            api.sendMessage(textFormat('error', 'errCmdExceptionError', err, global.config.PREFIX), event.threadID, event.messageID);
        }
        
	}
}