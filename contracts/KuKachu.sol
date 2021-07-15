// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./token/ERC20/ERC20.sol";
import "./koffeeswap/IKoffeeSwapFactory.sol";
import "./koffeeswap/IKoffeeSwapRouter.sol";
import "./koffeeswap/IKoffeeSwapPair.sol";

contract KuKachu is AccessControl, ERC20 {
    using Address for address;

    mapping(address => uint256) private _balances;
    mapping (address => uint256) private _cooldownOf;

    mapping (address => uint256) private _rOwned;
    mapping (address => uint256) private _tOwned;

    uint256 private constant _MAX = ~uint256(0);
    uint256 private _tTotal = 1000000000 * 10 ** 6 * 10 ** 9;
    uint256 private _rTotal = (_MAX - (_MAX % _tTotal));
    uint256 private constant _DAT = 20;
    uint16 private constant _LPFEE = 20;
    uint16 private constant _BURNFEE = 10;
    uint16 private constant _DEVFEE = 10;
    uint16 private constant _MARKETINGFEE = 20;
    uint16 private constant _REWARDFEE = 40;
    uint256 private _tFeeTotal = _DAT + _LPFEE + _BURNFEE + _DEVFEE + _MARKETINGFEE + _REWARDFEE;
    uint16 private constant _BURNSELLFEE = 100;
    uint16 private constant _LPSELLFEE = 30;
    uint256 private _tSellFeeTotal = _tFeeTotal + _BURNSELLFEE + _LPSELLFEE;
    uint16 internal constant _DIV = 1000;

    bool private _midSwap;

    IKoffeeSwapRouter private constant _ROUTER = IKoffeeSwapRouter(0xc0fFee0000C824D24E0F280f1e4D21152625742b); //mainnet
    address private _routerAddress;
    IKoffeeSwapPair private _pair;
    address private _pairAddress;
    address private constant _BURNADDRESS = address(0x000000000000000000000000000000000000dEaD);
    address payable private constant _DEV = payable(0x74ef9EC3Fb076a348B8f8fE0326Af4aea60DeD7c);
    address payable private constant _MARKETING = payable(0x74ef9EC3Fb076a348B8f8fE0326Af4aea60DeD7c);
    address payable private constant _REWARD = payable(0x74ef9EC3Fb076a348B8f8fE0326Af4aea60DeD7c);
    address private _thisAddress;
    address[] private _tokenPath = new address[](2);
    address[] private _wkcsPath = new address[](2);

    uint256 private _launchTime;
    uint256 private _maxTxAmount;
    uint256 private _minToSell = _tTotal * 1 / _DIV;
    uint256 private _maxHolding = _tTotal * 10 / _DIV;
    bool private _tokenCreated;
    bool private _contractIsLaunched = false;
    uint256 private _contractRestriction = _launchTime + (1 weeks);

    string private _name;
    string private _symbol;
    uint8 private immutable _decimals = 9;

    event DevAdded(uint256 kcsAdded);
    event MarketingAdded(uint256 kcsAdded);
    event RewardAdded(uint256 kcsAdded);
    event LpAdded(uint256 kcsAdded, uint256 tokensAdded);
    event TokensBurned(uint256 kcsSpent, uint256 tokensBurned);

    constructor(string memory name_, string memory symbol_) 
        ERC20(name_, symbol_)
    {
        _thisAddress = address(this);
        _routerAddress = address(_ROUTER);
        _pairAddress = IKoffeeSwapFactory(_ROUTER.factory()).createPair(_thisAddress, _ROUTER.WKCS());
        _pair = IKoffeeSwapPair(_pairAddress);
        _tokenPath[0] = _thisAddress;
        _tokenPath[1] = _ROUTER.WKCS();
        _wkcsPath[0] = _ROUTER.WKCS();
        _wkcsPath[1] = _thisAddress;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }
    receive() external payable {}

    function activate(string memory name_, string memory symbol_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!_contractIsLaunched, "KuKachu: contract is launched"); // can't be called after launch
        _name = name_;
        _symbol = symbol_;
        _contractIsLaunched = true;
        _launchTime = block.timestamp;
    }

    function launch() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!_tokenCreated, 'Token already created');
        require(!_contractIsLaunched, "KuKachu: contract is launched"); // can't be called after launch
        require(_thisAddress.balance >= 800 ether, 'Contract requires a balance of at least 800 KCS to create the token'); 

        _rOwned[_thisAddress] = _rTotal;
        emit Transfer(address(0), _thisAddress, _tTotal);
        _midSwap = true;
        _approve(_thisAddress, routerAddress(), _MAX);
        _addLiquidity(_thisAddress.balance, balanceOf(_thisAddress));
        _midSwap = false;
        _tokenCreated = true;
    }

    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }

    function setMaxTxPercent(uint256 maxTxPercent) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _maxTxAmount = _tTotal * maxTxPercent / _DIV;
    }

    function currentLiquidityFee() public pure returns (uint256) {
        return _LPFEE;
    }

    function burnAddress() public pure returns(address) {
        return _BURNADDRESS;
    }

    function routerAddress() public view returns(address) {
        return _routerAddress;
    }

    function pairAddress() public view returns(address) {
        return _pairAddress;
    }

    function balanceOf(address account) public view override returns (uint256) {
        if (account == pairAddress()) return _tOwned[account];
        return tokenFromReflection(_rOwned[account]);
    }

    function tokenFromReflection(uint256 rAmount) public view returns(uint256) {
        require(rAmount <= _rTotal, "KuKachu: rAmount greater than total reflections");
        return rAmount / _getRate();
    }

    function reflectionFromToken(uint256 tAmount, bool deductTransferFee) public view returns(uint256) {
        (uint256 rAmount,uint256 rTransferAmount,,,,,,,,) = _getTxValues(tAmount, false);
        if (!deductTransferFee) return rAmount;
        return rTransferAmount;
    }

    function maxTxAmount() public view returns(uint256) {
        return _maxTxAmount;
    }

    function maxHoldingAmount() public view returns(uint256) {
        return _maxHolding;
    }

    function totalFees() public view returns (uint256) {
        return _tFeeTotal;
    }

    function totalSellFees() public view returns (uint256) {
        return _tSellFeeTotal;
    }

    function cooldownOf(address account) public view returns (uint256) {
        return _cooldownOf[account];
    }

    /**
    * @dev Validation of an incoming transfer. Use require statements to revert state when conditions are not met.
    * Use `super` in contracts that inherit from ERC20 to extend their validations.
    * Example from ERC20.sol's _preValidateTokenTransfer method:
    *     super._preValidateTokenTransfer(from, to, amount);
    * @param from Address performing the token transfer
    * @param to Address where the token sent to
    * @param amount amount of token sent
    *
    * Requirements:
    *
    * - `beneficiary` cannot be the zero address.
    * - the caller must have a balance of at least `amount`.
    * - `amount` cannot be zero.
    * - `amount` cannot be greater than maxTxAmount.
    * - `amount` + receiverBalance cannot be greater than maxHoldingAmount.
    */
    function _preValidateTokenTransfer(
         address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._preValidateTokenTransfer(from, to, amount);
        require(amount > 0, "KuKachu: transfer zero amount");
        if (!_midSwap) {
            uint256 receiverBalance = balanceOf(to);
            require(amount <= maxTxAmount(), "KuKachu: transfer amount exceeds the maxTxAmount");
            require(amount + receiverBalance <= maxHoldingAmount(), "KuKachu: transfer amount +  receiverBalance exceeds the maxHoldingAmount");
        }
    }

    /**
    * @dev Executed when a deposit has been validated and is ready to be executed. Doesn't necessarily emit/send
    * tokens.
    * @param from The sender of the token
    * @param to the receiver of the token
    * @param amount Number of tokens transfer
    */
    function _processTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        uint256 senderBalance = balanceOf(from);
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        if (from == pairAddress()) {
            _transferFromPool(from, to, amount);
        } else if (to == pairAddress()) {
            _transferToPool(from, to, amount);
        } else {
            _transferStandard(from, to, amount);
        }
    }

    function _setCooldownOf(address recipient) internal {
        _cooldownOf[recipient] = block.timestamp + (5 minutes);
    }

    function _transferFromPool(address sender, address recipient, uint256 tAmount) private {
        if (_contractRestriction <= block.timestamp) {
            require(
                !recipient.isContract() ||
                tx.origin == recipient,
                "KuKachu: recipient is a contract address"
            );
        }
        _setCooldownOf(recipient);
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rBurnFee,
            uint256 rDevFee,
            uint256 rMarketingFee,
            uint256 rRewardFee,
            uint256 rDat,
            uint256 rLpFee,
            uint256 tTransferAmount,
        ) = _getTxValues(tAmount, false);
        unchecked {
            _tOwned[pairAddress()] -= tAmount;
            _rOwned[pairAddress()] -= rAmount;
        }

        _rOwned[burnAddress()] += rBurnFee;
        emit Transfer(address(0), burnAddress(), rBurnFee);
        
        _rOwned[recipient] += rTransferAmount;

        uint256 swapAmount =  rDevFee + rMarketingFee + rRewardFee + rLpFee;
        _rOwned[_thisAddress] += swapAmount;
        emit Transfer(address(0), _thisAddress, swapAmount);

        _rTotal -= rDat;
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferToPool(address sender, address recipient, uint256 tAmount) private {
        if (_contractRestriction <= block.timestamp) {
            require(
                !sender.isContract() ||
                tx.origin == sender,
                "KuKachu: sender is a contract address"
            );
        }
        require(cooldownOf(sender) < block.timestamp);
        _setCooldownOf(sender);
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rBurnFee,
            uint256 rDevFee,
            uint256 rMarketingFee,
            uint256 rRewardFee,
            uint256 rDat,
            uint256 rLpFee,
            uint256 tTransferAmount,
        ) = _getTxValues(tAmount, true);
        unchecked {
            _rOwned[sender] -= rAmount;
        }

        if (balanceOf(_thisAddress) >=_minToSell) _swapLiquidity();
        
        _rOwned[burnAddress()] += rBurnFee;
        emit Transfer(address(0), burnAddress(), rBurnFee);

        _rOwned[recipient] += rTransferAmount;
        _tOwned[recipient] += rTransferAmount;

        uint256 swapAmount =  rDevFee + rMarketingFee + rRewardFee + rLpFee;
        _rOwned[_thisAddress] += swapAmount;
        emit Transfer(address(0), _thisAddress, swapAmount);

        _rTotal -= rDat;
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferStandard(address sender, address recipient, uint256 tAmount) private {
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rBurnFee,
            uint256 rDevFee,
            uint256 rMarketingFee,
            uint256 rRewardFee,
            uint256 rDat,
            uint256 rLpFee,
            uint256 tTransferAmount,
        ) = _getTxValues(tAmount); 
        unchecked {
            _rOwned[sender] -= rAmount;
        }
        if (balanceOf(_thisAddress) >=_minToSell) _swapLiquidity();

        _rOwned[burnAddress()] += rBurnFee;
        emit Transfer(address(0), burnAddress(), rBurnFee);

        _rOwned[recipient] += rTransferAmount;
        _tOwned[recipient] += rTransferAmount;
        
        uint256 swapAmount =  rDevFee + rMarketingFee + rRewardFee + rLpFee;
        _rOwned[_thisAddress] += swapAmount;
        emit Transfer(address(0), _thisAddress, swapAmount);

        _rTotal -= rDat;
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _getTxValues(uint256 tAmount, bool sell) private view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
        (
            uint256 tTransferAmount,
            uint256 tBurnFee,
            uint256 tDevFee,
            uint256 tMarketingFee,
            uint256 tRewardFee,
            uint256 tDat,
            uint256 tLpFee
        ) = _getTValues(tAmount, sell);
        uint256 currentRate =  _getRate();
        (
            uint256 rAmount,
            uint256 rTransferAmount,
            uint256 rBurnFee,
            uint256 rDevFee,
            uint256 rMarketingFee,
            uint256 rRewardFee,
            uint256 rDat,
            uint256 rLpFee
        ) = _getRValues(tAmount, tBurnFee, tDevFee, tMarketingFee, tRewardFee, tDat, tLpFee, currentRate);
        return (
            rAmount,
            rTransferAmount,
            rBurnFee,
            rDevFee,
            rMarketingFee,
            rRewardFee,
            rDat,
            rLpFee,
            tTransferAmount,
            currentRate
        );
    }

    function _getTValues(uint256 tAmount, bool sell) private pure returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
        (
            uint256 tFeesToSwap,
            uint256 tDevFee,
            uint256 tMarketingFee,
            uint256 tRewardFee,
            uint256 tLpFee
        ) = _getFeesToSwap(tAmount, sell);
        uint256 tBurnFee;
        if (sell) {
            tBurnFee = tAmount * _BURNSELLFEE / _DIV;
        } else {
            tBurnFee = tAmount * _BURNFEE / _DIV;
        }
        uint256 tDat = tAmount * _DAT / _DIV;
        uint256 tTransferAmount = (tAmount - tFeesToSwap - tBurnFee - tDat);
        return (
            tTransferAmount,
            tBurnFee,
            tDevFee,
            tMarketingFee,
            tRewardFee,
            tDat,
            tLpFee
        );
    }

    function _getRValues(
        uint256 tAmount,
        uint256 tBurnFee,
        uint256 tDevFee,
        uint256 tMarketingFee,
        uint256 tRewardFee,
        uint256 tDat,
        uint256 tLpFee,
        uint256 currentRate
    ) private pure returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
        uint256 rAmount = tAmount * currentRate;
        uint256 rBurnFee = tBurnFee * currentRate;
        uint256 rDevFee = tDevFee * currentRate;
        uint256 rMarketingFee = tMarketingFee * currentRate;
        uint256 rRewardFee = tRewardFee * currentRate;
        uint256 rDat = tDat * currentRate;
        uint256 rLpFee = tLpFee * currentRate;
        uint256 rTransferAmount = rBurnFee - rDevFee - rMarketingFee - rRewardFee - rDat - rLpFee;
        return (
            rAmount,
            rTransferAmount,
            rBurnFee,
            rDevFee,
            rMarketingFee,
            rRewardFee,
            rDat,
            rLpFee
        );
    }

    function _getFeesToSwap(uint256 amount, bool sell) private pure returns(uint256, uint256, uint256, uint256, uint256) {
        uint256 devFee = amount * _DEVFEE / _DIV;
        uint256 marketingFee = amount * _MARKETINGFEE / _DIV;
        uint256 rewardFee = amount * _REWARDFEE / _DIV;
        uint256 lpFee;
        if (sell) {
            lpFee = amount * _LPSELLFEE / _DIV;
        } else {
            lpFee = amount * _LPFEE / _DIV;
        }
        uint256 totalFeesToSwap = devFee + marketingFee + rewardFee + lpFee;
        return (totalFeesToSwap, devFee, marketingFee, rewardFee, lpFee);
    }

    function _getRate() private view returns(uint256) {
        return (_rTotal - _rOwned[pairAddress()]) / (_tTotal - _tOwned[pairAddress()]);
    }

    function _swapLiquidity() private {
        _midSwap = true;
        uint256 lpAmount = balanceOf(_thisAddress) * _LPFEE / _DIV;
        uint256 lpTokensToConvert = lpAmount / 2;
        uint256 swapAmount = balanceOf(_thisAddress) - lpTokensToConvert;

        if (allowance(_thisAddress, routerAddress()) < swapAmount) _approve(_thisAddress, routerAddress(), _MAX);
        
        uint256 kcsBalance = _thisAddress.balance;
        _swapTokensForKcs(swapAmount);
        uint256 kscReceived = _thisAddress.balance - kcsBalance;

        uint256 devFee = kscReceived * _DEVFEE / _DIV;
        payable(_DEV).transfer(devFee);
        emit DevAdded(devFee);

        uint256 marketingFee = kscReceived * _MARKETINGFEE / _DIV;
        payable(_MARKETING).transfer(marketingFee);
        emit MarketingAdded(marketingFee);

        uint256 rewardFee = kscReceived * _REWARDFEE / _DIV;
        payable(_REWARD).transfer(rewardFee);
        emit RewardAdded(rewardFee);
            
        uint256 lpFee = kscReceived * _LPFEE / _DIV;
        _addLiquidity(lpFee, lpTokensToConvert);  
        emit LpAdded(lpFee, lpTokensToConvert);
        _midSwap = false;
    }

    function _swapTokensForKcs(uint256 swapAmount) private {
        _ROUTER.swapExactTokensForKCSSupportingFeeOnTransferTokens(swapAmount, 0, _tokenPath, _thisAddress, block.timestamp);
    }

    function _swapKcsForTokens(uint256 kcsAmount) private {
        _ROUTER.swapExactKCSForTokensSupportingFeeOnTransferTokens{value: kcsAmount}(0, _wkcsPath, burnAddress(), block.timestamp);
    }

    function _addLiquidity(uint256 kscAmount, uint256 tokenAmount) private {
        _ROUTER.addLiquidityKCS{value: kscAmount}(_thisAddress, tokenAmount, 0, 0, _msgSender(), block.timestamp);
    }
}
