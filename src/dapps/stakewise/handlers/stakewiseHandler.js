import BigNumber from 'bignumber.js';
import rewardsAbi from './abi/rewardEthToken';
import stakedAbi from './abi/stakedEthToken';
import poolAbi from './abi/pool';
import mewStakedContract from './abi/mewStakedContract';
import {
  POOL_API,
  SETH2_MAINNET_CONTRACT,
  SETH2_GOERLI_CONTRACT,
  RETH2_MAINNET_CONTRACT,
  RETH2_GOERLI_CONTRACT,
  POOL_GOERLI_CONTRACT,
  POOL_MAINNET_CONTRACT,
  MEW_GOERLI_CONTRACT
} from './configs';

export default class StakewiseHandler {
  constructor(web3, isEth) {
    const seth2Contract = isEth
      ? SETH2_MAINNET_CONTRACT
      : SETH2_GOERLI_CONTRACT;
    const reth2Contract = isEth
      ? RETH2_MAINNET_CONTRACT
      : RETH2_GOERLI_CONTRACT;
    const mewProxyContract = isEth ? MEW_GOERLI_CONTRACT : MEW_GOERLI_CONTRACT;
    const poolContract = isEth ? POOL_MAINNET_CONTRACT : POOL_GOERLI_CONTRACT;
    this.rewardsContract = new web3.eth.Contract(rewardsAbi, reth2Contract);
    this.stakedContract = new web3.eth.Contract(stakedAbi, seth2Contract);
    this.poolContract = new web3.eth.Contract(poolAbi, poolContract);
    this.mewProxyContract = new web3.eth.Contract(
      mewStakedContract,
      mewProxyContract
    );
    this.poolAddress = poolContract;
  }

  getEthPool() {
    return this.stakedContract.methods.totalSupply().call();
  }

  getStakingFee() {
    return this.rewardsContract.methods.protocolFee().call();
  }

  getValidatorApr() {
    return new Promise((resolve, reject) => {
      fetch(POOL_API)
        .then(res => {
          return res.json();
        })
        .then(res => {
          const val = res.validators_apr;
          // netFee = val - (val * (10/100))
          const netFee = BigNumber(val).minus(
            BigNumber(val).times(BigNumber(10).div(100))
          );
          resolve(netFee.toString());
        })
        .catch(reject);
    });
  }
}
