const fs = require('fs');
const readline = require('readline');
const path = require('path');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadInputStream(dirname, filename) {
    const rl = readline.createInterface({
        input: fs.createReadStream(path.resolve(dirname, filename)),
        crlfDelay: Infinity
    });
    return rl;
}

module.exports = {sleep, loadInputStream};
