module.exports.config = {
	name: 'reboot',
	version: '1.0.6',
	hasPermssion: 2,
	description: 'Reboot this bot.',
	commandCategory: 'system',
	usage: '',
	cooldowns: 60,
	credits: 'Hadestia',
	aliases: [ 'boot' ]
}

module.exports.run = function ({ api, args, event, Utils, Threads }) {
	
	const { spawn } = require('child_process');
	const { threadID, messageID } = event;
	
	const response = Utils.textFormat('system', 'botReboot');
	
	async function updateResource(err, info) {
		
		if (err) {
			Utils.logger(`botReboot.js  ${err}`, 'error');
			return api.sendMessage(Utils.textFormat('system', 'botRebootError'), threadID, messageID);
		}
		
		const assetSession = await spawn('node', ['--trace-warnings', '--async-stack-traces', `${global.HADESTIA_BOT_CLIENT.mainPath}/scripts/assets.js`], {
			cwd: __dirname,
	    	stdio: 'inherit',
	    	shell: true
		});
	
		assetSession.on('error', function(error) {
	   	Utils.logger('An error occurred: ' + JSON.stringify(error), 'error');
		});

    	assetSession.on('close', function () {
			process.exit(1);
		});
	}
	
	return api.sendMessage(
		response,
		threadID,
		updateResource,
		messageID
	);
}