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
        const prefix = this.getPrefix(currentNodeRef[i], keyLowercase);
        const prefixLength = prefix.length;

        if (prefixLength == 0) {
          continue;
        }

        noSamePrefix = false;
        if ((prefixLength == nodeReferenceKeyLength) && (keyLowercase.length >= nodeReferenceKeyLength)) {
          if (keyLowercase.length == nodeReferenceKeyLength) {
            currentNodeRef[i].value = value;
            foundFlag = true;
          } else if (keyLowercase.length > nodeReferenceKeyLength) {
            currNode = currentNodeRef[i];
          }
        } else {
          const tempRef = [...currentNodeRef[i].ref];
          let v = prefixLength != nodeReferenceKeyLength ? null : value;
          foundFlag = prefixLength == keyLowercase.length ? true : false;

          currentNodeRef[i].clearReference()
            .insertReference(currentNodeRef[i].key.slice(prefixLength), currentNodeRef[i].value) // original reference in the last index
            .changeKey(prefix.join(''))
            .changeValue(v);

          currentNodeRef[i].ref[currentNodeRef[i].ref.length - 1].ref = [...tempRef];
          currNode = currentNodeRef[i];
        }
        keyLowercase = keyLowercase.slice(prefixLength);
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
        const prefix = this.getPrefix(currentNodeRef[i], keyLowercase);
        const prefixLength = prefix.length;

        if (prefixLength == 0) {
          continue;
        }

        if (keyLowercase === currentNodeRef[i].key) { // found
          return currentNodeRef[i].value;
        } else if (keyLowercase.length > nodeReferenceKeyLength) {
          keyLowercase = keyLowercase.slice(prefixLength);
          currNode = currentNodeRef[i];
          noSamePrefix = false;
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
        const prefix = this.getPrefix(currentNodeRef[i], keyLowercase);
        const prefixLength = prefix.length;

        if (prefixLength == 0) {
          continue;
        }

        if (keyLowercase === currentNodeRef[i].key) { // found
          // Condition 1 => Not a prefix node, a leaf node then delete node
          if (currentNodeRef[i].ref.length == 0) {
            currentNodeRef.splice(i, 1);
            return true;
          }

          // Condition 2 => It is a prefix node, unmark node
          if (currentNodeRef[i].ref.length == 1) {
            const childNode = currentNodeRef[i].ref[0];
            const concatenatedKey = `${currentNodeRef[i].key}${childNode.key}`
            childNode.changeKey(concatenatedKey);
            currentNodeRef[i] = childNode;
          } else {
            currentNodeRef[i].changeValue(null);
          }

          return true;
        } else if (keyLowercase.length > nodeReferenceKeyLength) {
          keyLowercase = keyLowercase.slice(prefixLength);
          currNode = currentNodeRef[i];
          noSamePrefix = false;
          break;
        } 
      }

      if (noSamePrefix == true) {
        break;
      }
    }

    return null;
  }

  getPrefix(node, key) {
    const prefix = [];
    for (let j = 0, k = 0; j < key.length && k < node.key.length; j++ , k++) {
      const buf1 = Buffer.from(key[j]);
      const buf2 = Buffer.from(node.key[k]);
      if (buf1.compare(buf2) == 0) {
        prefix.push(key[j]);
      } else {
        break;
      }
    }

    return prefix;
  }

  isLeaf(node) {
    if (node.ref.length == 0) {
      return true;
    }

    return false;
  }
}

module.exports = RadixTrie;
