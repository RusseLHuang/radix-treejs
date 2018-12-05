const fs = require('fs');
const path = require('path');
const RadixTrie = require('./dist/radix-trie');

const radix = new RadixTrie();

const words = fs.readFileSync(path.join(__dirname, './dict.txt'), 'utf8');
words.split('\n')
  .forEach(word => radix.insert(word, 1));

const args = process.argv.slice(2);
if (!args[0]) {
  throw "Please input your words";
} 

console.time('start');
const result = radix.search(args[0]);
console.log(result);
console.timeEnd('start');
