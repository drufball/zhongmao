const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('cedict_ts.u8')
});

let characterDict = {};

rl.on('line', line => {
  // Skip the copyright line
  if(!line.split('[')[1]) {
    return;
  }
  // First grab the simplified character
  const character = line.split(' ')[1] // .split()[0]=traditional

  // Next grab the reading
  const right = line.split('[')[1];
  const reading = right.split(']')[0];

  // Next grab the meanings
  let rawMeanings = right.split(']')[1];
  rawMeanings = rawMeanings.trim().split('/');
  const meanings = rawMeanings.slice(1, rawMeanings.length-1);

  // Check to see if character already exists in dictionary
  if(!characterDict[character]) {
    characterDict[character] = [{
      'reading': reading,
      'meanings': meanings
    }];
  }
  else {
    characterDict[character].push({
      'reading': reading,
      'meanings': meanings
    });
  }
});

let teachingDict = {};
rl.on('close', () => {
  const rl2 = readline.createInterface({
    input: fs.createReadStream('word-order.txt')
  });

  rl2.on('line', line => {
    const character = line.split(',')[0];
    const order = line.split(',')[1];

    teachingDict[character] = {
      'order': order,
      'detail': characterDict[character]
    };
  });

  rl2.on('close', () => {
    fs.writeFile('characters-full.txt', JSON.stringify(teachingDict, null, 2), err => {
      if(err) {
        console.log(err);
      }
      else {
        console.log("File saved!");
      }
    });
  });
});
