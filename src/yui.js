//messages.json added to gitignore for privacy purposes, refer to https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb for input layout.
const qrcode = require('qrcode-terminal');
const openai = require('./openA1');
const dotenv = require("dotenv").config();
let fs = require('fs');

const { Client,LocalAuth } = require('whatsapp-web.js');

var messages = JSON.parse(fs.readFileSync("messages.json")).messages

const parseAuthor = (username) => {
    let author = ""
    for (let i = 0; i < username.length; i++) { 
        if (username[i] !== '@') {
            author += username[i]
        }
        else { 
            break
        }
    }
    return author
}

const removeMentionsFromBody = (body) => {
    let mention = false; 
    let output = ""
    for (let i = 0; i < body.length; i++) {
        if (mention === false) {
            if (body[i] == "@") {
                mention = true
            }
            else {
                output += body[i]
            }
        }
        else { 
            if (body[i] == " ") {
                mention = false
            }
        }
    }
    return output
}

const yuiMain = (message) => {
    let command = removeMentionsFromBody(message.body.toLowerCase().trim());
    let author = parseAuthor(message.from)
    console.log(author + ": " + command)
    if (message._data.quotedParticipant == '12564848434@c.us' || message.mentionedIds.includes('12564848434@c.us') || message._data.inviteGroupType == undefined) {
        messages.push({"role":"user","name":author,"content":command})
        try {
            const response = openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 1,
                max_tokens: 500,
                top_p: 0.3,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
            });
            response.then((result, error) => {
                if (error) {
                    console.log(error)
                    fs.writeFileSync("messages.json",JSON.stringify({"messages":[{"role":"system","content":process.env.RESET_MESSAGE}]}))
                }
                try {
                    message.reply(result.data.choices[0].message.content)
                    messages.push({"role":"assistant","content":result.data.choices[0].message.content})
                    fs.writeFileSync("messages.json",JSON.stringify({messages:messages}))
                }
                catch(err) { 
                    console.log(err);
                    message.reply("Yui here!\n\nI wasn't able to process that, try rewording it!")
                }
            })
        } catch {
            message.reply("Sorry, can you repeat yourself?")
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

client.on('message', message => {
	yuiMain(message)
});

client.initialize();