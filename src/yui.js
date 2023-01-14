const qrcode = require('qrcode-terminal');
const openai = require('./openA1');
const {addPreviousID, readPreviousIDList} = require('./readWrite');

const { Client,LocalAuth } = require('whatsapp-web.js');

const parseCommand = (message) => { 
    let output = "";
    for (let i = 7;i<message.length;i++) {
        output += message[i]
    }
    return output
}

const findTimeframe = (message) => { 
    let modifier = "";
    let time = 0;
    let reply = ""
    for(let i = 0; i<message.length; i++) {
        if (isNaN(message[i]) || message[i] == " ") {
            continue
        }
        else{ 
            let number = message[i]; 
            if (message[i+1] != " ") {
                number += message[i+1];
                i+=1;
            }
            number = parseInt(number);
            for (let x = i+1; x<message.length;x++) {
                if (message[x] != " ") {
                    modifier += message[x]
                }
            }
            switch (modifier){
                case "hours": 
                    time = 1000 * 60 * 60 * (number - 1);
                    reply = ["I'll let everyone know when your presentation is an hour away!","Your presentation is an hour away!"]
                    break;

                case "hour": 
                    time = 1000 * 60 * 45;
                    reply = ["I'll let everyone know when your presentation is 15 minutes away!","Your presentation is 15 minutes away!"]
                    break;

                case "minutes": 
                    if (number > 15) {
                        time = 1000 * 60 * (number - 15);
                        reply = ["I'll let everyone know when your presentation is 15 minutes away!","Your presentation is 15 minutes away!"]
                    }
                    else { 
                        time = 0; 
                        reply = "Time to get started preparing for it!"
                    }
                    break;

                case "minute":
                    time = 0; 
                    reply = "Time to get started preparing for it!"
                    break;

                case "seconds": 
                    reply = "Test response!"
                    time = 1000 * number
                    break;
                    
                default: 
                    time = null; 
                    reply = null; 
                    break; 
            }

        }

    }
    return {time:time,reply:reply} 
}

const sendReminder = (message,reply) => { 
    message.reply("Yui here!\n\n"+reply)
}
const yuiMain = (message) => {
    let command = parseCommand(message.body.toLowerCase()).trim();
    console.log(command);
    if (command.includes("presentation") || command.includes("assignment due")) { 
        if (command.includes("presentation")) {
            const {time,reply} = findTimeframe(command);
            if (time != null && reply != null) {
                setTimeout(sendReminder,time,message,reply);
            }
        }
        else {
            message.reply("Yui here!\n\nI'll alert everyone when your presentation due date is close.")
        }
    }
    else{
        switch(command) { 
            case 'introduce yourself':
                message.reply("Yui here!\n\nI'm Karl's AI Assistant. Ask me a question or give me tasks! I listen to all messages starting with 'hey yui'.");
                break;

            default:
                if(command.startsWith('re!') == false){
                    const response = openai.createCompletion({
                        model: "text-davinci-003",
                        prompt: command,
                        previous_id: readPreviousIDList(),
                        temperature: 0.1,
                        max_tokens: 150,
                        top_p: 1.0,
                        frequency_penalty: 0.0,
                        presence_penalty: 0.0,
                    });
                    
                    response.then((result) => {
                        message.reply("Yui here! "+ result.data.choices[0].text);
                        console.log(result.data)
                    })
                }
                break;
        }
    }
}

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message_create', message => {
	if (message.body.toLowerCase().startsWith('hey yui')){
        yuiMain(message);
    }
});

client.initialize();
