const qrcode = require('qrcode-terminal');
const openai = require('./openA1');

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
    for(let i = 0; i<message.length; i++) {
        if (isNaN(message[i]) || message[i] == " ") {
            continue
        }
        else{ 
            let number = message[i]; 
            for (let x = i+1; x<message.length;x++) {
                if (message[x] != " ") {
                    modifier += message[x]
                }
            }
            switch (modifier){
                case "hours": 
                    time = 1000 * 60 * 60 * number - 1 
                case "minutes": 
                    time = 1000 * 60 * number - 15 
                case "seconds": 
                    time = 1000 * number
            }

        }

    }
    return time 
}

const sendReminder = (message) => { 
    message.reply("Yui here!\n\nYour presentation is close!")
}
const yuiMain = (message) => {
    let command = parseCommand(message.body.toLowerCase()).trim();
    console.log(command);
    if (command.includes("presentation") || command.includes("assignment due")) { 
        if (command.includes("presentation")) {
            message.reply("Yui here!\n\nI'll alert everyone when your presentation is close.");
            setTimeout(sendReminder,findTimeframe(command),message);
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
                        model: "text-curie-001",
                        prompt: "Respond to this in a cute, girly way: "+ command,
                        temperature: 0.9,
                        max_tokens: 300,
                        top_p: 1.0,
                        frequency_penalty: 0.0,
                        presence_penalty: 0.0,
                    });
                    
                    response.then((result) => {
                        message.reply("Yui here! "+ result.data.choices[0].text);
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
