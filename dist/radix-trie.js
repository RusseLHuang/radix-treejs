class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.ref = [];
  }

  insertReference(key, value) {
    const newNode = new Node(key, value);
    this.ref.push(newNode);
    return this;
  }

  changeKey(key) {
    this.key = key;
    return this;
  }

  changeValue(value) {
    this.value = value;
    return this;
  }

  clearReference() {
    this.ref = [];
    return this;
  }
}

class RadixTrie {
  constructor() {
    this.root = new Node("", "");
  }

  insert(key, value) {
    if (key === "" || value === "") {
      throw "Bullshit";
    }

    let keyLowercase = key.toLowerCase();
    let currNode = this.root;
    let foundFlag = false;

    /*
    1. search from prefix until it is find
    2. if it is leaf node, then create node
    */

    while (!foundFlag) {
      if (this.isLeaf(currNode)) {
        currNode.insertReference(keyLowercase, value);
        foundFlag = true;
        continue;
      }

      // Look to current node reference
      const currentNodeRef = currNode.ref;
      let noSamePrefix = true;

      for (let i = 0; i < currentNodeRef.length; i++) {
        const nodeReferenceKeyLength = currentNodeRef[i].key.length;

        let index = -1;
        let st = [];
        for (let j = 0, k = 0; j < keyLowercase.length && k < currentNodeRef[i].key.length; j++ , k++) {
          const buf1 = Buffer.from(keyLowercase[j]);
          const buf2 = Buffer.from(currentNodeRef[i].key[k]);
          if (buf1.compare(buf2) == 0) {
            st.push(keyLowercase[j]);
            index = j;
          } else {
            break;
          }
        }

        if (index < 0) {
          continue;
        }

        noSamePrefix = false;
        if (keyLowercase.length < nodeReferenceKeyLength && index + 1 == keyLowercase.length) { // "d => def"
          const tempRef = [...currentNodeRef[i].ref];

          currentNodeRef[i].clearReference()
            .insertReference(currentNodeRef[i].key.slice(index + 1), currentNodeRef[i].value) // original reference in the last index
            .changeKey(st.join(''))
            .changeValue(value);

          currentNodeRef[i].ref[currentNodeRef[i].ref.length - 1].ref = [...tempRef];
          foundFlag = true;
        } else if (index + 1 != nodeReferenceKeyLength) { // ex "abcdef" => "abcxx"
          const tempRef = [...currentNodeRef[i].ref];

          currentNodeRef[i].clearReference()
            .insertReference(currentNodeRef[i].key.slice(index + 1), currentNodeRef[i].value) // original reference in the last index
            .changeKey(st.join(''))
            .changeValue(null);

          currentNodeRef[i].ref[currentNodeRef[i].ref.length - 1].ref = [...tempRef];
          keyLowercase = keyLowercase.slice(index + 1);
          currNode = currentNodeRef[i];
        } else if (keyLowercase.length == nodeReferenceKeyLength) {
          currentNodeRef[i].value = value;
          foundFlag = true;
        } else if (keyLowercase.length > nodeReferenceKeyLength) {
          keyLowercase = keyLowercase.slice(index + 1);
          currNode = currentNodeRef[i];
        }

      }

      if (noSamePrefix == true) {  // ex: "abcdef" => "daefasd" 
        currNode.insertReference(keyLowercase, value);
        foundFlag = true;
      }
    }
  }

  search(key) {
    if (key === "") {
      throw "Bullshit";
    }

    let keyLowercase = key.toLowerCase();
    let currNode = this.root;
    let foundFlag = false;

    while (!foundFlag) {
      // Look to current node reference
      const currentNodeRef = currNode.ref;
      let noSamePrefix = true;

      for (let i = 0; i < currentNodeRef.length; i++) {
        const nodeReferenceKeyLength = currentNodeRef[i].key.length;

        let index = -1;
        for (let j = 0, k = 0; j < keyLowercase.length && k < currentNodeRef[i].key.length; j++ , k++) {
          const buf1 = Buffer.from(keyLowercase[j]);
          const buf2 = Buffer.from(currentNodeRef[i].key[k]);

          if (buf1.compare(buf2) != 0) {
            break;
          }
          index = j;
        }

        if (index < 0) {
          continue;
        }

        if (keyLowercase === currentNodeRef[i].key) { // found
          return currentNodeRef[i].value;
        } else if (keyLowercase.length > nodeReferenceKeyLength) {
          noSamePrefix = false;
          keyLowercase = keyLowercase.slice(index + 1);
          currNode = currentNodeRef[i];
          break;
        }
      }

      if (noSamePrefix == true) {  // ex: "abcdef" => "daefasd"  key is not exist
        return null;
      }
    }
  }

  delete(key) {
    if (key === "") {
      throw "Bullshit";
    }

    let keyLowercase = key.toLowerCase();
    let currNode = this.root;
    let foundFlag = false;

    while (!foundFlag) {
      // Look to current node reference
      const currentNodeRef = currNode.ref;
      let noSamePrefix = true;

      for (let i = 0; i < currentNodeRef.length; i++) {
        const nodeReferenceKeyLength = currentNodeRef[i].key.length;

        let index = -1;
        for (let j = 0, k = 0; j < keyLowercase.length && k < currentNodeRef[i].key.length; j++ , k++) {
          const buf1 = Buffer.from(keyLowercase[j]);
          const buf2 = Buffer.from(currentNodeRef[i].key[k]);

          if (buf1.compare(buf2) != 0) {
            break;
          }
          index = j;
        }

        if (index < 0) {
          continue;
        }

        if (keyLowercase === currentNodeRef[i].key) { // found
          // Condition 1 => Not a prefix node, a leaf node then delete node
          if (currentNodeRef[i].ref.length == 0) {
            return currentNodeRef.splice(i, 1);
          }

          // Condition 2 => It is a prefix node, unmark node
          if (currentNodeRef[i].ref.length == 1) {
            const childNode = currentNodeRef[i].ref[0];
            currentNodeRef[i] = childNode;
          } else {
            currentNodeRef[i].changeValue(null);
          }
          
          return true;
        } else if (keyLowercase.length > nodeReferenceKeyLength) {
          noSamePrefix = false;
          keyLowercase = keyLowercase.slice(index + 1);
          currNode = currentNodeRef[i];
          break;
        }
      }

      if (noSamePrefix == true) {  // ex: "abcdef" => "daefasd"  key is not exist
        return null;
      }
    }
  }

  deleteHelper(node, key) {

  }

  isLeaf(node) {
    if (node.ref.length == 0) {
      return true;
    }

    return false;
  }
}

module.exports = RadixTrie;
