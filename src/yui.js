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

const yuiMain = (message) => {
    let command = parseCommand(message.body.toLowerCase()).trim();
    console.log(command);
    switch(command) { 
        case 'introduce yourself':
            message.reply("Yui here!\n\nI'm Karl's AI Assistant. Ask me a question or give me tasks! I listen to all messages starting with 'hey yui'.");
            break;

        default:
            if(command.startsWith('re!') == false){
                const response = openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: "Using JavaScript and message.reply(), respond to the prompt or answer the question provided in plaintext and no explanation: "+command,
                    temperature: 0.3,
                    max_tokens: 300,
                    top_p: 1.0,
                    frequency_penalty: 0.0,
                    presence_penalty: 0.0,
                });
                
                response.then((result) => {
                    eval(result.data.choices[0].text);
                })
            }
            break;
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
