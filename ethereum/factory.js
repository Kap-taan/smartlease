import web3 from './web3';
import AgreementFactory from './build/AgreementFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(AgreementFactory.interface),
  '0x76939298C896488176685FA5D9C34d64D12B4e46'
);

export default instance;
