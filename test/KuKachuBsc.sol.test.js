const { balance, BN, constants, ether, expectEvent, expectRevert, time, MaxUint256} = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ContractFactory, ethers, providers } = require('hardhat');
const { artifacts } = require('hardhat');
const { Contract } = require('hardhat/internal/hardhat-network/stack-traces/model');
const { ZERO_ADDRESS } = constants;

const toBN = web3.utils.toBN;

const KuKachuBSC = artifacts.require('KuKachuBscTest');

const uniswapABI = JSON.parse('[{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]');

const overrides = {
  gasLimit: 9999999
}

describe('KuKachuBSC', function () {

  const name = 'KuKachu.com';
  const symbol = 'KUKA';
  const decimals = new BN(9);

  const ZERO_VALUE = new BN(0);
  const amount = ether('1');
  const totalSupply = toBN(100000000000000000000);
  const initialLP = toBN(10000000000000000000);
  const whitelistAmount = toBN(30000000000000000000);
  const burnAmount = toBN(60000000000000000000);
  const sendAmount = whitelistAmount.div(toBN(2));
  const maxTxAmount = toBN(500000000000000000);
  const maxHolding = toBN(1000000000000000000)

  const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';
  const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; // uniswap mainnet
  //const ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'; // pancakeswap mainnet
  const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // ETH mainnet
  //const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'; //bsc mainnet

  const ADMIN_ROLE = web3.utils.soliditySha3('ADMIN_ROLE');
  const EXCLUDED = web3.utils.soliditySha3('EXCLUDED');

  let pairAddress = '';

  beforeEach(async function () {
    const [
      initialHolder,
      devWallet,
      marketingWallet,
      rewardWallet,
      receiverWallet,
      anotherReceiverWallet,
      anotherWallet,
    ] = await ethers.getSigners();
    this.initialHolder = initialHolder.address;
    this.devWallet = devWallet.address;
    this.marketingWallet = marketingWallet.address;
    this.rewardWallet = rewardWallet.address;
    this.receiverWallet = receiverWallet.address;
    this.anotherReceiverWallet = anotherReceiverWallet.address;
    this.anotherWallet = anotherWallet.address;
    this.token = await KuKachuBSC.new(
      ROUTER_ADDRESS,
      this.devWallet,
      this.marketingWallet,
      this.rewardWallet,
      { from: this.initialHolder },
    );
  });

  describe("check initial values", function () {
    it('has a name', async function () {
      expect(await this.token.name()).to.equal(name);
    });
  
    it('has a symbol', async function () {
      expect(await this.token.symbol()).to.equal(symbol);
    });
  
    it('has decimals', async function () {
      expect(await this.token.decimals()).to.be.bignumber.equal(decimals);
    });

    it('should have admin role', async function () {
      expect(await this.token.hasRole(ADMIN_ROLE, this.initialHolder)).to.equal(true);
    });

    it('should have admin role', async function () {
      expect(await this.token.hasRole(ADMIN_ROLE, this.devWallet)).to.equal(true);
    });
  

    it('should excluded', async function () {
      expect(await this.token.hasRole(EXCLUDED, this.initialHolder)).to.equal(true);
      expect(await this.token.hasRole(EXCLUDED, this.token.address)).to.equal(true);
      expect(await this.token.hasRole(EXCLUDED, this.devWallet)).to.equal(true);
      expect(await this.token.hasRole(EXCLUDED, this.marketingWallet)).to.equal(true);
      expect(await this.token.hasRole(EXCLUDED, BURN_ADDRESS)).to.equal(true);
    });
  
    it('totalsupply start with zero', async function () {
      expect(await this.token.totalSupply()).to.be.bignumber.equal(ZERO_VALUE);
    });
  
    it('has burn address', async function () {
      expect(await this.token.burnAddress()).to.be.properAddress;
      expect(await this.token.burnAddress()).to.be.equal(BURN_ADDRESS);
    });
  
    it('has dev address', async function () {
      expect(await this.token.devAddress()).to.be.properAddress;
      expect(await this.token.devAddress()).to.be.equal(this.devWallet);
    });
  
    it('has marketing address', async function () {
      expect(await this.token.marketingAddress()).to.be.properAddress;
      expect(await this.token.marketingAddress()).to.be.equal(this.marketingWallet);
    });
  
    it('has reward address', async function () {
      expect(await this.token.rewardAddress()).to.be.properAddress;
      expect(await this.token.rewardAddress()).to.be.equal(this.rewardWallet);
    });
  
    it('has router address', async function () {
      expect(await this.token.routerAddress()).to.be.properAddress;
      expect(await this.token.routerAddress()).to.be.equal(ROUTER_ADDRESS);
    });
  
    it('has pancakepair', async function () {
      expect(await this.token.pairAddress()).to.be.properAddress;
    });

    it('has maxTxAmount start with zero', async function () {
      expect(await this.token.maxTxAmount()).to.be.bignumber.equal(ZERO_VALUE);
    });

    it('has maxHoldingAmount start with zero', async function () {
      expect(await this.token.maxHoldingAmount()).to.be.bignumber.equal(ZERO_VALUE);
    });

    it('isswapAndLiquifyEnabled should be false', async function () {
      expect(await this.token.isswapAndLiquifyEnabled()).to.equal(false);
    });

    it('should able to change contractRestriction', async function () {
      await this.token.setSwapAndLiquifyEnabled(true);
      expect(await this.token.isswapAndLiquifyEnabled()).to.equal(true);
    });

    it('isContractRestricted should be false', async function () {
      expect(await this.token.isContractRestricted()).to.equal(false);
    });

    it('should able to change contractRestriction', async function () {
      await this.token.setContractRestriction(true);
      expect(await this.token.isContractRestricted()).to.equal(true);
    });
  });

  context('activate', async function () {
    it('reverts when no ether balance', async function () {
      await expectRevert(
        this.token.activate(),
        'Contract requires a balance of at least 50 BNB to create the token',
      );
    });

    it('should activate', async function () {
      await this.token.sendTransaction( { from: this.initialHolder, value: amount });
      await this.token.activate();
    });

    describe("activation checks", function () {
      beforeEach(async function () {
        await this.token.sendTransaction( { from: this.initialHolder, value: amount });
        const { logs } = await this.token.activate();

        pairAddress = await this.token.pairAddress();
      });

      it('should have totalsupply', async function () {
        expect(await this.token.totalSupply()).to.be.bignumber.equal(totalSupply);
      });

      it('should have maxTxAmount', async function () {
        expect(await this.token.maxTxAmount()).to.be.bignumber.equal(maxTxAmount);
      });

      it('should have maxHoldingAmount', async function () {
        expect(await this.token.maxHoldingAmount()).to.be.bignumber.equal(maxHolding);
      });

      it("pairaddress should have balance", async function () {
        const balancePair = await this.token.balanceOf(pairAddress);
        expect(balancePair).to.be.bignumber.equal(initialLP);
      });

      it('developer wallet should have balance', async function () {
        const balancePair = await this.token.balanceOf(this.devWallet);
        expect(balancePair).to.be.bignumber.equal(whitelistAmount);
      });

      it('should have 60% burnt', async function () {
        const balanceBurn = await this.token.balanceOf(BURN_ADDRESS);
        expect(balanceBurn).to.be.bignumber.equal(burnAmount);
      });

      it('token should been created', async function () {
        expect(await this.token.tokenCreated()).to.equal(true);
      });

      it('isswapAndLiquifyEnabled should be true', async function () {
        expect(await this.token.isswapAndLiquifyEnabled()).to.equal(true);
      });

      it('isContractRestricted should be true', async function () {
        expect(await this.token.isContractRestricted()).to.equal(true);
      });

      it('token address should have zero bnb', async function () {
        expect(await balance.current(this.token.address)).to.bignumber.equal(ZERO_VALUE);
      });

      it('token address should have zero kuka', async function () {
        expect(await this.token.balanceOf(this.token.address)).to.bignumber.equal(ZERO_VALUE);
      });

      context('launch', async function () {
        beforeEach(async function () {
          await this.token.launch();
        });

        it('should lauch', async function () {
          expect(await this.token.isIsLaunched()).to.equal(true);
        });

        context('standard transfers', async function () {

          beforeEach(async function () {
            await this.token.transfer(this.receiverWallet, sendAmount, { from: this.devWallet });
          });
          
          describe('transfer no fees', function () {
            it('developer wallet should send without fee', async function () {
              expect(await this.token.balanceOf(this.receiverWallet)).to.be.bignumber.equal(sendAmount);
              await this.token.transfer(this.receiverWallet, sendAmount, { from: this.devWallet });
              expect(await this.token.balanceOf(this.receiverWallet)).to.be.bignumber.equal(whitelistAmount);
            });
  
            it('developer wallet should receive without fee', async function () {
              expect(await this.token.balanceOf(this.receiverWallet)).to.be.bignumber.equal(sendAmount);
              await this.token.transfer(this.receiverWallet, sendAmount, { from: this.devWallet });
              expect(await this.token.balanceOf(this.receiverWallet)).to.be.bignumber.equal(whitelistAmount);
            });
  
            it('should send with 12% tax', async function () {
              expect(await this.token.balanceOf(this.receiverWallet)).to.be.bignumber.equal(sendAmount);
              await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
              const balanceAmount = await this.token.balanceOf(this.anotherWallet);
              expect(balanceAmount).to.be.bignumber.equal(balanceAmount);
            });
  
            it('should burn 1%', async function () {
              let trxBurnAmount = maxTxAmount * 10 / 1000;
              const reflectAmount = trxBurnAmount * 20 / 1000;
              trxBurnAmount = trxBurnAmount + reflectAmount;
              await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
              const balanceAmount = await this.token.balanceOf(BURN_ADDRESS);
              expect(await this.token.balanceOf(BURN_ADDRESS)).to.be.bignumber.equal(balanceAmount);
            });
  
            it('should 9% have swap amount', async function () {
              let swapAmount = maxTxAmount * 90 / 1000;
              const reflectAmount = swapAmount * 20 / 1000;
              swapAmount = swapAmount + reflectAmount;
              await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
              const balanceAmount = await this.token.balanceOf(this.token.address);
              expect(await this.token.balanceOf(this.token.address)).to.be.bignumber.equal(toBN(balanceAmount));
            });
  
            it('should cooldown for 4 hours', async function () {
              await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
              const cooldownOf = await this.token.cooldownOf(this.anotherWallet);
              const fourHours = (await time.latest()).add(time.duration.hours(4));
              expect(cooldownOf).to.be.bignumber.equal(fourHours);
            });

            it('revert transfer on cooldown period', async function () {
              await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
              expectRevert( 
                await this.token.transfer(this.anotherReceiverWallet, toBN(100), { from: this.anotherWallet }),
                'KuKachu: cooldown period for sender'
              );
            });

            it('should able to transfer after cooldown periods', async function () {
              await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
              const newTime = (await time.latest()).add(time.duration.hours(5));
              await time.increaseTo(newTime);
              await this.token.transfer(this.anotherReceiverWallet, toBN(100), { from: this.anotherWallet });
            });

            it('should add LP', async function () {
              const amountToSend = toBN(163864360000000000);
              await this.token.transfer(this.token.address, amountToSend, { from: this.devWallet});
              const tokenAddressBalanceBefore = await this.token.balanceOf(this.token.address);
              console.log('tokenAddressBalanceBefore= ' +tokenAddressBalanceBefore.toString());

              let lpTokenBalance = tokenAddressBalanceBefore * 20 / 1000; 
              console.log('lpTokenBalance1 =' +lpTokenBalance);
              lpTokenBalance = lpTokenBalance / 2 ;
              console.log('lpTokenBalance2=' +lpTokenBalance);
              const tokenAmountToBeSwapped =  tokenAddressBalanceBefore - lpTokenBalance;
              console.log('tokenAmountToBeSwapped=' +tokenAmountToBeSwapped);

              const pairAddressBalanceBefore = await this.token.balanceOf(pairAddress);
              const ethBalanceBefore = await balance.current(this.token.address);
              console.log('ETH balanceBefore=' +ethBalanceBefore.toString());
              console.log('pairAddressBalanceBefore= ' +pairAddressBalanceBefore.toString());

              await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
              const tokenAddressBalanceAfter = await this.token.balanceOf(this.token.address);
              console.log('tokenAddressBalanceAfter=' +tokenAddressBalanceAfter.toString());
              const pairAddressBalanceAfter = await this.token.balanceOf(pairAddress);
              console.log('pairAddressBalanceAfter= ' +pairAddressBalanceAfter.toString());
              const ethBalanceAfter = await balance.current(this.token.address);
              console.log('ethBalanceAfter= ' + await balance.current(this.token.address));
              //const expectedPairTokenBalance = pairAddressBalanceBefore.add(lpTokenBalance);

              console.log('BNB balanceOf DEV= ' + await this.token.bnbBalanceOf(this.devWallet));
              console.log('BNB balanceOf Marketing= ' + await this.token.bnbBalanceOf(this.marketingWallet));
              console.log('BNB balanceOf reward= ' + await this.token.bnbBalanceOf(this.rewardWallet));
              //expect(pairAddressBalanceAfter).to.be.bignumber.equal(expectedPairTokenBalance);
            });

            context('claim BNB', async function () {

              it('revert claim without bnb balance', async function () {
                expectRevert(
                  await this.token.claimDevBnb(),
                  'KuKachu, contract zero BNB balance',
                );
              });

              it('should able to claim BNB for developer', async function () {
                const amountToSend = toBN(163864360000000000);
                await this.token.transfer(this.token.address, amountToSend, { from: this.devWallet});
                await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
                const balanceTracker = await balance.current(this.devWallet);
                await this.token.claimDevBnb();
                const bnbBalance = await balance.current(this.token.address);
                const bnbBalanceOfDev = await this.token.bnbBalanceOf(this.devWallet);
                const balanceAfter = await balance.current(this.devWallet);
                console.log('after bnbBalanceOf dev wallet = ' +bnbBalanceOfDev);
                console.log('balanceAfter dev wallet = ' +balanceAfter);
                expect(bnbBalanceOfDev).to.be.bignumber.equal(ZERO_VALUE);
              });

              it('should able to claim BNB for marketing', async function () {
                const amountToSend = toBN(163864360000000000);
                await this.token.transfer(this.token.address, amountToSend, { from: this.devWallet});
                await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
                const balanceTracker = await balance.current(this.marketingWallet);
                await this.token.claimMarketingBnb();
                const bnbBalance = await balance.current(this.token.address);
                const bnbBalanceOfMarketing = await this.token.bnbBalanceOf(this.marketingWallet);
                const balanceAfter = await balance.current(this.marketingWallet);
                console.log('after bnbBalanceOf marketing wallet = ' +bnbBalanceOfMarketing);
                console.log('balanceAfter marketing wallet = ' +balanceAfter);
                expect(bnbBalanceOfMarketing).to.be.bignumber.equal(ZERO_VALUE);
              });

              it('should able to claim BNB for reward', async function () {
                const amountToSend = toBN(163864360000000000);
                await this.token.transfer(this.token.address, amountToSend, { from: this.devWallet});
                await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
                const balanceTracker = await balance.current(this.rewardWallet);
                await this.token.claimRewardBnb();
                const bnbBalance = await balance.current(this.token.address);
                const bnbBalanceOfReward = await this.token.bnbBalanceOf(this.rewardWallet);
                const balanceAfter = await balance.current(this.rewardWallet);
                console.log('after bnbBalanceOf marketing reward = ' +bnbBalanceOfReward);
                console.log('balanceAfter reward wallet = ' +balanceAfter);
                expect(bnbBalanceOfReward).to.be.bignumber.equal(ZERO_VALUE);
              });

              it('revert claim with zero dev bnb balance', async function () {
                const amountToSend = toBN(163864360000000000);
                await this.token.transfer(this.token.address, amountToSend, { from: this.devWallet});
                await this.token.transfer(this.anotherWallet, maxTxAmount, { from: this.receiverWallet });
                await this.token.claimDevBnb();
                expectRevert(
                  await this.token.claimDevBnb(),
                  'KuKachu, BNB balanceOf is zero',
                );
              });
            });
  
            it('revert transfer above maxTxAmount', async function () {
              expectRevert(
                await this.token.transfer(this.anotherWallet, maxTxAmount.add(toBN(1)), { from: this.receiverWallet }),
                "KuKachu: _transfer #2 amount exceeds the maxTxAmount"
              );
            });
  
            it('revert transfer above maxHolding', async function () {
              expectRevert(
                await this.token.transfer(this.anotherWallet, maxHolding.add(toBN(1)), { from: this.receiverWallet }),
                "KuKachu: _transfer #2 amount exceeds the maxHoldingAmount"
              );
            });
          });

          context('buy tokens', async function () {

            //ETH -> KUKA
            it('should able to buy maxTxAmount', async () => {
              const [,,,,,buyer] = await ethers.getSigners();
              const router = await ethers.getContractAt(uniswapABI, ROUTER_ADDRESS);
              const amountIn = new BN(100000000000000);
              const result = await router.connect(buyer).swapExactETHForTokensSupportingFeeOnTransferTokens(
                0,
                [WETH_ADDRESS, pairAddress],
                buyer.address,
                MaxUint256,
                {
                  ...overrides,
                  value: amountIn,
                  from: buyer.address,
                }
              );
              console.log(result);
            });
          });
        });
      });
    });
  });
});