/**
    Copyright (c) 2018 Cryptense SAS - Kryll.io

    Kryll.io / KRL ERC20 Token Smart Contract    
    Version 0.1

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

import './TransferableToken.sol';
import 'zeppelin/contracts/math/SafeMath.sol';


contract KryllToken is TransferableToken {
    using SafeMath for uint256;

    string public symbol = "KRL";
    string public name = "Kryll.io Token";
    uint8 public decimals = 18;
  

    uint256 constant internal DECIMAL_CASES    = (10 ** uint256(decimals));
    uint256 constant public   SALE             =  17737348 * DECIMAL_CASES; // Token sale
    uint256 constant public   TEAM             =   8640000 * DECIMAL_CASES; // TEAM (vested)
    uint256 constant public   ADVISORS         =   2880000 * DECIMAL_CASES; // Advisors
    uint256 constant public   SECURITY         =   4320000 * DECIMAL_CASES; // Security Reserve
    uint256 constant public   PRESS_MARKETING  =   5040000 * DECIMAL_CASES; // Press release
    uint256 constant public   USER_ACQUISITION =  10080000 * DECIMAL_CASES; // User Acquisition 
    uint256 constant public   BOUNTY           =    720000 * DECIMAL_CASES; // Bounty (ICO & future)

    address public sale_address     = 0x0;
    address public team_address     = 0x0;
    address public advisors_address = 0x0;
    address public security_address = 0x0;
    address public press_address    = 0x0;
    address public user_acq_address = 0x0;
    address public bounty_address   = 0x0;
    bool private initialDistributionDone = false;

    /**
    * @dev Setup the initial distribution addresses
    */
    function reset(address _saleAddrss, address _teamAddrss, address _advisorsAddrss, address _securityAddrss, address _pressAddrss, address _usrAcqAddrss, address _bountyAddrss) public onlyOwner{
        require(!initialDistributionDone);
        team_address = _teamAddrss;
        advisors_address = _advisorsAddrss;
        security_address = _securityAddrss;
        press_address = _pressAddrss;
        user_acq_address = _usrAcqAddrss;
        bounty_address = _bountyAddrss;
        sale_address = _saleAddrss;
    }

    /**
    * @dev compute & distribute the tokens
    */
    function distribute() public onlyOwner {
        // Initialisation check
        require(!initialDistributionDone);
        require(sale_address != 0x0 && team_address != 0x0 && advisors_address != 0x0 && security_address != 0x0 && press_address != 0x0 && user_acq_address != 0 && bounty_address != 0x0);      

        // Compute total supply 
        totalSupply_ = SALE.add(TEAM).add(ADVISORS).add(SECURITY).add(PRESS_MARKETING).add(USER_ACQUISITION).add(BOUNTY);

        // Distribute KRL Token 
        balances[owner] = totalSupply_;
        emit Transfer(0x0, owner, totalSupply_);

        transfer(team_address, TEAM);
        transfer(advisors_address, ADVISORS);
        transfer(security_address, SECURITY);
        transfer(press_address, PRESS_MARKETING);
        transfer(user_acq_address, USER_ACQUISITION);
        transfer(bounty_address, BOUNTY);
        transfer(sale_address, SALE);
        initialDistributionDone = true;
    }

    /**
    * @dev Allows owner to later update token name if needed.
    */
    function setName(string _name) onlyOwner public {
        name = _name;
    }

    /**
    * @dev returns the distribution state
    */
    function isInitialDistributionDone() public constant returns (bool) {
        return initialDistributionDone;
    }
}