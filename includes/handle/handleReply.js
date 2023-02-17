module.exports = function({ api, models, Users, Threads, Currencies }) {

    return async function({ event }) {

        if (!event.messageReply) { return; }
		
		const timeNow = Date.now();
		const { threadData } = global.data;
        const { handleReply, commands } = global.client
        const { messageID, threadID, messageReply } = event;
        
        const threadSetting = threadData.get(threadID) || {};
        
        const botPrefix = (threadSetting.hasOwnProperty('PREFIX')) ? threadSetting.PREFIX : global.config.PREFIX;

        if (handleReply.length !== 0) {

            const indexOfHandle = handleReply.findIndex(e => e.messageID == messageReply.messageID);

            if (indexOfHandle < 0) { return; }
            
            const indexOfMessage = handleReply[indexOfHandle];
            const handleNeedExec = commands.get(indexOfMessage.name);
            
			const deleteData = async () => {
				try { api.unsendMessage(indexOfMessage.messageID); } catch (e) {};
				return await global.client.handleReply.splice(indexOfHandle, 1);
			}
            
            if (event.senderID !== indexOfMessage.author) return api.sendMessage(global.textFormat('error', 'errCommandReplyInteractionFailed'), threadID, (err, info) => { global.autoUnsend(err, info, 5) }, messageID);

            if (!handleNeedExec) return api.sendMessage(global.getText('handleReply', 'missingValue'), threadID, messageID);
			
			if (indexOfMessage.timeout && indexOfMessage.timeout < timeNow) {
				deleteData();
				api.sendMessage(global.textFormat('error', 'errCommandReplyInteractionTimeout'), threadID, (err, info) => { global.autoUnsend(err, info, 5) }, messageID);
				return;
			}
			
            try {

                var getText2;
                
                if (handleNeedExec.languages && typeof handleNeedExec.languages == 'object')
                    getText2 = (...value) => {
                        const reply = handleNeedExec.languages || {};
                        if (!reply.hasOwnProperty(global.config.language)) {
                            return api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messengeID);
						}
						
                        var lang = handleNeedExec.languages[global.config.language][value[0]] || '';
                        for (var i = value.length; i > -0x4 * 0x4db + 0x6d * 0x55 + -0x597 * 0x3; i--) {
                            const expReg = RegExp('%' + i, 'g');
                            lang = lang.replace(expReg, value[i]);
                        }
                        return lang;
                    };

                else getText2 = () => {};
                //// command returns
                const returns = {};
                
                returns.invalid_reply_syntax = function () {
                	api.sendMessage(global.textFormat('error', 'errCmdReplyInvalidSyntax', botPrefix, indexOfMessage.name), threadID);
                }
                // other user interaction failed
                returns.interaction_failed_other = function () {
                	api.sendMessage(global.textFormat('error', 'errCommandReplyInteractionFailed'), threadID, (err, info) => { global.autoUnsend(err, info, 5) }, messageID);
                }
                
                returns.delete_data = deleteData;

                const Obj = {};

                Obj.api = api;

                Obj.event = event;

                Obj.models = models;

                Obj.Users = Users;

                Obj.Threads = Threads;

                Obj.Currencies = Currencies;
                
                Obj.Prefix = botPrefix;

                Obj.handleReply = indexOfMessage;

                Obj.models = models;

                Obj.getText = getText2;

				Obj.returns = returns;
				
                handleNeedExec.handleReply(Obj);
                
                return;
                
            } catch (error) {
                return api.sendMessage(global.getText('handleReply', 'executeError', error), threadID, messageID);
            }
        }
    };
}