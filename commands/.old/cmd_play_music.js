module.exports.config = {
  name: "play",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Hadestia",
  description: "Play music from youtube",
  commandCategory: "media",
  usages: "<title>",
  cooldowns: 10,
  dependencies: {
  	"axios": "",
	  "fs-extras": "",
	  "request": ""
  }
};

module.exports.run = async({api, event}) => {
	const axios = require("axios");
    const fs = require("fs-extra");
    const Innertube = require("youtubei.js");
    const request = require("request");
    let input = event.body;
    
    var text = input;
    text = text.substring(6) //after 6 characters
	let data = input.split(" ");
    
    // if no title given
	if (data.length < 2) {
		return api.sendMessage("✖ include atleast the title or name of the music.", event.threadID);
	}
  
	data.shift();

	// ctto: SaikiDesu
    const youtube = await new Innertube();
 
    const search = await youtube.search(text);
    if (search.videos[0] === undefined){	
  	api.sendMessage(global.defaultResponse.invalidReq,event.threadID,event.messageID)
	  api.setMessageReaction("❎", event.messageID, (err) => {}, true)
    }else{
    	api.sendMessage((global.defaultResponse.searchingRep).replace('{text}', text),  event.threadID,event.messageID);
    	api.setMessageReaction("✅", event.messageID, (err) => {}, true)
    	var timeleft = 3;
    	var downloadTimer = setInterval(function(){
       	 if(timeleft <= 0){
   	  	   clearInterval(downloadTimer);
       	 }
      	  timeleft -= 1;
        }, 1000); 
   	 const stream = youtube.download(search.videos[0].id, {
    	  format: 'mp4',
          type: 'audio',
          audioQuality: 'lowest',
          loudnessDB: '20',
          audioBitrate: '320',
          fps: '30'
      });
  
      stream.pipe(fs.createWriteStream(__dirname + `/cache/${search.videos[0].title}.mp3`))


  	stream.on('start', () => { console.info('[DOWNLOADER]', 'Starting download now!'); }); 
 	 stream.on('info', (info) => {
  		console.info('[DOWNLOADER]',`Downloading ${info.video_details.title} by ${info.video_details.metadata.channel_name}`);
   	   console.log(info)
  	});

  
  	stream.on('end', () => {
 		 // process.stdout.clearLine();
 		 // process.stdout.cursorTo(0);
  		console.info(`[DOWNLOADER] Downloaded`)
    
      	 var message = {
         	 body:("I've found it!^ ^\n\n▶ title: "+search.videos[0].title),
         	 attachment:[ fs.createReadStream(__dirname + `/cache/${search.videos[0].title}.mp3`)]
     	  }
     	  api.sendMessage(message, event.threadID,event.messageID);
   	}); 
  	 stream.on('error', (err) => console.error('[ERROR]',err))
 	  stream.on('end', async () => {  
   		if (fs.existsSync(__dirname + `/cache/${search.videos[0].title}.mp3`)) {
       			fs.unlink(__dirname + `/cache/${search.videos[0].title}.mp3`, function (err) {
       				if (err) console.log(err);                                        
       	   		 console.log(__dirname + `/cache/${search.videos[0].title}.mp3 is deleted!`);
    	   		});
 	  	}
    	})
	}
}