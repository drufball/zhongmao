const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('characters-full.txt')
});

let jsonString = "";
rl.on('line', line => {
  jsonString += line;
});

rl.on('close', () => {
  const characters = JSON.parse(jsonString);
  for (var character in characters) {
    if (!characters.hasOwnProperty(character)) {
        //The current property is not a direct property of p
        continue;
    }
    //Do your logic with the property here
    if(!characters[character].detail) {
      console.log(`No detail found for ${character}`);
    }
  }
})
