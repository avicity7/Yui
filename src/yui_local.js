//messages.json added to gitignore for privacy purposes, refer to https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb for input layout.
const openai = require('./openA1');
const prompt = require('prompt-sync')();
let fs = require('fs');

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
                output += mention[i]
            }
        }
        else { 
            if (body[i] == " ") {
                mention = false
            }
        }
    }
}

const yuiMain = (message) => {
    messages.push({"role":"user","content":message})
    try {
        const response = openai.createChatCompletion({
            model: "gpt-4",
            messages: messages,
            temperature: 1,
            max_tokens: 500,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        
        response.then((result) => {
            try {
                console.log(result.data.choices[0].message.content)
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

const question = prompt('Enter prompt: ')
yuiMain(question)
