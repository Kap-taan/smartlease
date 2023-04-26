const path = require('path');
// Solidity compiler
const solc = require('solc');
// File system
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const agreementPath = path.resolve(__dirname, 'contracts', 'Agreement.sol');
const source = fs.readFileSync(agreementPath, 'utf8');
const output = solc.compile(source, 1).contracts;

// Making the 'build' folder
fs.ensureDirSync(buildPath);

// Looping over the keys
for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract]
    );
}
