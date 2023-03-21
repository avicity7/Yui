const openai = require('./openA1');
const readLine = require('readline');
const askYui = (command) => {
    const response = openai.createCompletion({
        model: "text-davinci-003",
        prompt: command,
        temperature: 0.3,
        max_tokens: 500,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    response.then((result)=>{
        console.log(result.data.choices[0].text)
    })
}
var input = require('readline-sync') ;

askYui(input.question("Prompt: "))