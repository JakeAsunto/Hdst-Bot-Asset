module.exports.config = {
	name: "delete",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "SaikiDesu",
	description: "put in the trash meme",
	commandCategory: "edit-img",
	usages: "[blank or tag]",
	cooldowns: 5,
	dependencies: {"fs-extra": "","discord.js": "","discord-image-generation" :""}
};

module.exports.run = async ({ event, api, args, Users }) => {
  const DIG = require("discord-image-generation");
  const Discord = require('discord.js');
  const request = require('axios');
  const fs = require("fs-extra");
  
  let { senderID, threadID, messageID } = event;
  var id = Object.keys(event.mentions)[0] || event.senderID;
  
  var avatar = (await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=${FB_ACCESS_TOKEN}`, { responseType: 'arraybuffer' } )).data;
  
  let img = await new DIG.Delete().getImage(avatar);
  console.info(img);
  let attach = new Discord.MessageAttachment(img);
  var path_delete = __dirname + "/cache/delete.png";
  fs.writeFileSync(path_delete, attach.attachment);
  api.sendMessage({attachment: fs.createReadStream(path_delete)}, event.threadID, () => fs.unlinkSync(path_delete), event.messageID);
}