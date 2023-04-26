const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/AgreementFactory.json');

const provider = new HDWalletProvider(
    'reason treat prosper meat eagle earth rate extra that cable emerge fuel',
    // remember to change this to your own phrase!
    'https://sepolia.infura.io/v3/4f6f906d8548415f953a6992e660fb76'
    // remember to change this to your own endpoint!
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(
        JSON.parse(compiledFactory.interface)
    )
        .deploy({ data: compiledFactory.bytecode })
        .send({ gas: '1000000', from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
};
deploy();
