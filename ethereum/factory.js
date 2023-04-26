import web3 from './web3';
import AgreementFactory from './build/AgreementFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(AgreementFactory.interface),
  '0x2843754F28f6faDdD75006065952747530F66E6b'
);

export default instance;
