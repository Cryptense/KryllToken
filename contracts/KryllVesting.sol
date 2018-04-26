/**
    Copyright (c) 2018 Cryptense SAS - Kryll.io

    Kryll.io / KRL Vesting Smart Contract
    Version 0.2
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

    based on the contracts of OpenZeppelin:
    https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts
**/

pragma solidity ^0.4.23;
import './KryllToken.sol';
import 'zeppelin/contracts/ownership/Ownable.sol';
import 'zeppelin/contracts/math/SafeMath.sol';

/**
 * @title KryllVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period.
 */
contract KryllVesting is Ownable {
    using SafeMath for uint256;

    event Released(uint256 amount);

    // beneficiary of tokens after they are released
    address public beneficiary;
    KryllToken public token;

    uint256 public startTime;
    uint256 public cliff;
    uint256 public released;


    uint256 constant public   VESTING_DURATION    =  31536000; // 1 Year in second
    uint256 constant public   CLIFF_DURATION      =   7776000; // 3 months (90 days) in second


    /**
    * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
    * _beneficiary, gradually in a linear fashion. By then all of the balance will have vested.
    * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
    * @param _token The token to be vested
    */
    function setup(address _beneficiary,address _token) public onlyOwner{
        require(startTime == 0); // Vesting not started
        require(_beneficiary != address(0));
        // Basic init
        changeBeneficiary(_beneficiary);
        token = KryllToken(_token);
    }

    /**
    * @notice Start the vesting process.
    */
    function start() public onlyOwner{
        require(token != address(0));
        require(startTime == 0); // Vesting not started
        startTime = now;
        cliff = startTime.add(CLIFF_DURATION);
    }

    /**
    * @notice Is vesting started flag.
    */
    function isStarted() public view returns (bool) {
        return (startTime > 0);
    }


    /**
    * @notice Owner can change beneficiary address
    */
    function changeBeneficiary(address _beneficiary) public onlyOwner{
        beneficiary = _beneficiary;
    }


    /**
    * @notice Transfers vested tokens to beneficiary.
    */
    function release() public {
        require(startTime != 0);
        require(beneficiary != address(0));
        
        uint256 unreleased = releasableAmount();
        require(unreleased > 0);

        released = released.add(unreleased);
        token.transfer(beneficiary, unreleased);
        emit Released(unreleased);
    }

    /**
    * @dev Calculates the amount that has already vested but hasn't been released yet.
    */
    function releasableAmount() public view returns (uint256) {
        return vestedAmount().sub(released);
    }

    /**
    * @dev Calculates the amount that has already vested.
    */
    function vestedAmount() public view returns (uint256) {
        uint256 currentBalance = token.balanceOf(this);
        uint256 totalBalance = currentBalance.add(released);

        if (now < cliff) {
            return 0;
        } else if (now >= startTime.add(VESTING_DURATION)) {
            return totalBalance;
        } else {
            return totalBalance.mul(now.sub(startTime)).div(VESTING_DURATION);
        }
    }
}