let fs = require('fs');


const addPreviousID = (previousID) => {
    var previousIDList = fs.readFileSync("previous_id.txt");
    previousIDList += previousID + ",";
    fs.writeFileSync("previous_id.txt",previousIDList)

}

const readPreviousIDList = () => {
    return fs.readFileSync("previous_id.txt"); 
}

//addPreviousID("test");
//console.log(fs.readFileSync("previous_id.txt","utf-8"))

module.exports = {
    addPreviousID,
    readPreviousIDList
}