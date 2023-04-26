const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledAgreement = require('../ethereum/build/Agreement.json');

let accounts;
let agreement;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    agreement = await new web3.eth.Contract(JSON.parse(compiledAgreement.interface))
        .deploy({
            data: compiledAgreement.bytecode,
            arguments: [1, accounts[0], 101, 1, "Sector 62", "Noida", 100, 100, "Anuj Kumar", accounts[1], 1678196255]
        })
        .send({ from: accounts[0], gas: 1000000 });

});

describe('Agreements', () => {
    it('deploys an agreement', () => {
        assert.ok(agreement.options.address);
    })
    it('can send only a specific amount for security deposit', async () => {
        let error;
        try {
            await agreement.methods.paySecurityDeposit().send({
                from: accounts[1],
                value: '50'
            })
        } catch (err) {
            error = err;
        }
        assert(error);
    })
    it('should allow only tenant to pay the security deposit', async () => {
        let error;
        try {
            await agreement.methods.paySecurityDeposit().send({
                from: accounts[0],
                value: '100'
            })
        } catch (err) {
            error = err;
        }
        assert(error);
    })
    it('should allow only tenant to pay the rent', async () => {
        let error;
        try {
            await agreement.methods.payRent(1675732733).send({
                from: accounts[0],
                value: '100'
            })
        } catch (err) {
            error = err;
        }
        assert(error);
    })
    it('should accept payment before the end date', async () => {
        let error;
        try {
            await agreement.methods.payRent(1680830333).send({
                from: accounts[0],
                value: '100'
            })
        } catch (err) {
            error = err;
        }
        assert(error);
    })
    it('can send only a specific amount for rent', async () => {
        let error;
        try {
            await agreement.methods.payRent(1675732733).send({
                from: accounts[1],
                value: '50'
            })
        } catch (err) {
            error = err;
        }
        assert(error);
    })
    it('builder can only end the agreement', async () => {
        let error;
        try {
            await agreement.methods.endAgreement().send({
                from: accounts[1],
            })
        } catch (err) {
            error = err;
        }
        assert(error);
    })
    it('builder can only finish the agreement', async () => {
        let error;
        try {
            await agreement.methods.finishAgreement().send({
                from: accounts[1],
            })
        } catch (err) {
            error = err;
        }
        assert(error);
    })
})