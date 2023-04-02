module.exports = function ({ api, Users, Banned, Threads }) {
	
	const util = require('../utils');
	const sendReaction = require('../utils/sendReaction.js'),
		textFormat = require('../utils/textFormat.js'),
		fancyFont = require('../utils/localFont.js'),
		editGif = require('../utils/editGif.js'),
		logger = require('../utils/log.js');
	
	
	const Utils = {};
	
	for (const func in util) Utils[func] = util[func];
	
	Utils.sendReaction = sendReaction;
	Utils.textFormat = textFormat;
	Utils.fancyFont = fancyFont;
	Utils.editGif = editGif;
	Utils.logger = logger;
	
	
	Utils.sendRequestError = function (err, event, prefix) {
		api.sendMessage(Utils.textFormat('error', 'errCmdExceptionError', err.message, prefix), event.threadID, ()=>{}, event.messageID);
	}
	
	Utils.logModuleErrorToAdmin = async function (err, filename, event) {
		console.error(filename, err);
		let name = '<DIRECT MESSAGE>';
		if (event.isGroup) {
			const data = await Threads.getData(event.threadID);
			name = (data) ? data.threadInfo.threadName : 'Uninitialize Group';
		}
		for (const admin of global.HADESTIA_BOT_CONFIG.ADMINBOT) {
			api.sendMessage(Utils.textFormat('events', 'eventModulesErrorToAdmin', filename, err, name || 'No Data', event.threadID, event.senderID), admin);
		}
	}
	
	Utils.autoUnsend = async function (err, info, delay = 120) {
		if (err) return console.log('AUTO UNSEND MESSAGE:', err);
		await new Promise(resolve => setTimeout(resolve, delay * 1000));
		return api.unsendMessage(info.messageID);
	}
	
	Utils.getModuleText = function (module = {}, event) {
    	if (!module.language) return function () {};
       
        return function (...values) {
        	if (!module.language.hasOwnProperty(global.HADESTIA_BOT_CONFIG.language)) {
        		const msg = Utils.getText('handleCommand', 'notFoundLanguage', module.config.name);
        		api.sendMessage(msg, event.threadID, ()=>{}, event.messageID);
				return Utils.logModuleErrorToAdmin(msg, module.config.name, event);
            }
			let lang = module.language[global.HADESTIA_BOT_CONFIG.language][values[0]] || '';
            for (var i = values.length; i > 0x16c0 + -0x303 + -0x1f * 0xa3; i--) {
                const expReg = RegExp('%' + i, 'g');
				lang = lang.replace(expReg, values[i]);
			}
			return lang;
        }
    }
    
    Utils.getText = function (...args) {
    	const langText = global.HADESTIA_BOT_DATA.language;
    	if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
    	var text = langText[args[0]][args[1]];

    	for (var i = args.length - 1; i > 0; i--) {
        	const regEx = RegExp(`%${i}`, 'g');
        	text = text.replace(regEx, args[i + 1]);

    	}
    	return text;
	}
    
    Utils.getRemainingTime = function (seconds) {
    	
		const hasS = (pref, count) => {
			return (count > 0) ? (count > 1) ? pref+'s' : pref : '';
		}
		
		seconds = Number(seconds);
		var d = Math.floor(seconds / (3600*24));
		var h = Math.floor(seconds % (3600*24) / 3600);
		var m = Math.floor(seconds % 3600 / 60);
		var s = Math.floor(seconds % 60);
	
		/*if (!v2) { // will send complete countdown details Day -> Seconds
			const sDisplay = s > 0 ? s + hasS('second', s) : '';
			const mDisplay = m > 0 ? m + (m == 1 ? (s > 0) ? ' minute and ' : ' minute' : (s > 0) ? ' minutes and ' : ' minutes') : '';
			const hDisplay = h > 0 ? h + (h == 1 ? (m > 0) ? ((s > 0) ? ' hour, ' : ' hour and ') : ((s > 0) ? ' hour and ' : ' hour') : (m > 0) ? ((s > 0) ? ' hours, ' : ' hours and ') : ((s > 0) ? ' hours and ' : ' hours')) : '';
			const dDisplay = d > 0 ? d + (d == 1 ? (h > 0) ? ((m > 0) ? ' day, ' : ' day and ') : ((h > 0) ? ' day and ' : ' day') : (h > 0) ? ((m > 0) ? ' days, ' : ' days and ') : ((h > 0 ) ? ' days and ' : ' days')) : '';
			return {
				day: d,
				hour: h,
				minute: m,
				second: s,
				toString: dDisplay + hDisplay + mDisplay + sDisplay
			};
		}*/
		const allTime = [
			{ val: d, name: 'day' },
			{ val: h, name: 'hour' },
			{ val: m, name: 'minute' },
			{ val: s, name: 'second' }
		];
	
		const result = [];
		for (const item of allTime) {
			if (result.length < 2 && item.val > 0) {
				result[result.length] = `${item.val} ${hasS(item.name, item.val)}`;
			}
		}
		// Out: 3 minutes and 1 second (example)
		return result.join(' and ');
	}
	
	return Utils;
}