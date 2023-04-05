module.exports = function({ api, models, Utils, Users, Threads, Banned }) {
	
    const moment = require("moment");

    return async function({ event }) {

        const timeStart = Date.now()

        const time = moment.tz("Asia/Manila").format("HH:MM:ss L");

		const { allowInbox, DeveloperMode } = global.HADESTIA_BOT_CONFIG;

        const { events } = global.HADESTIA_BOT_CLIENT;

        const { threadID, author } = event;

        const bannedGroupData = await Banned.getData(threadID);
        const bannedUserData = await Banned.getData(author);
        const groupData = await Threads.getData(threadID);
        
        // Group Banned? User Banned? Is PM?
        if (bannedUserData || bannedGroupData || !allowInbox && author == threadID) return;

        for (const [key, value] of events.entries()) {
			
			const evn = value.config.eventType
			const envConfig = value.config.envConfig || {};
			const groupDataPass = (envConfig.needGroupData) ? groupData && true : true;
			
            if (evn.indexOf(event.logMessageType) !== -1 && groupDataPass) {

                const eventRun = events.get(key);

                try {

                    const Obj = {};

                    Obj.api = api;

                    Obj.event = event;

                    Obj.models = models;
                    
                    Obj.Utils = Utils;

                    Obj.Users = Users;

					Obj.Banned = Banned;

                    Obj.Threads = Threads;
                    
                    Obj.getText = Utils.getModuleText(eventRun, event);

                    eventRun.run(Obj);

                    if (DeveloperMode) {
                        Utils.logger(Utils.getText('handleEvent', 'executeEvent', time, eventRun.config.name, threadID, Date.now() - timeStart), '[ Event ]');
                    }
                } catch (error) {
                    Utils.logger(Utils.getText('handleEvent', 'eventError', eventRun.config.name, JSON.stringify(error)), "error");
                }

            }

        }

        return;

    };

}