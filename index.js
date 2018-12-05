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

// radix.insert("abdcasd", 12)

// const r = new Radix();
// r.insert("abc", 123);
// r.insert("abcd", 123);
// r.insert("abc", 1234);
// r.insert("abcd", 12341122 );
// r.insert("ddd", 1234);
// console.log(r.root);
// console.log(r.root.ref[0]);