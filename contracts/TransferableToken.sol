/**
    Copyright (c) 2018 Cryptense SAS - Kryll.io

    Kryll.io / Transferable ERC20 token mechanism
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
import 'zeppelin/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin/contracts/ownership/Ownable.sol';


/**
 * @title Transferable token
 *
 * @dev StandardToken modified with transfert on/off mechanism.
 **/
contract TransferableToken is StandardToken,Ownable {

    /** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * @dev TRANSFERABLE MECANISM SECTION
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/

    event Transferable();
    event UnTransferable();

    bool public transferable = false;
    mapping (address => bool) public whitelisted;

    /**
        CONSTRUCTOR
    **/
    
    constructor() 
        StandardToken() 
        Ownable()
        public 
    {
        whitelisted[msg.sender] = true;
    }

    /**
        MODIFIERS
    **/

    /**
    * @dev Modifier to make a function callable only when the contract is not transferable.
    */
    modifier whenNotTransferable() {
        require(!transferable);
        _;
    }

    /**
    * @dev Modifier to make a function callable only when the contract is transferable.
    */
    modifier whenTransferable() {
        require(transferable);
        _;
    }

    /**
    * @dev Modifier to make a function callable only when the caller can transfert token.
    */
    modifier canTransfert() {
        if(!transferable){
            require (whitelisted[msg.sender]);
        } 
        _;
   }
   
    /**
        OWNER ONLY FUNCTIONS
    **/

    /**
    * @dev called by the owner to allow transferts, triggers Transferable state
    */
    function allowTransfert() onlyOwner whenNotTransferable public {
        transferable = true;
        emit Transferable();
    }

    /**
    * @dev called by the owner to restrict transferts, returns to untransferable state
    */
    function restrictTransfert() onlyOwner whenTransferable public {
        transferable = false;
        emit UnTransferable();
    }

    /**
      @dev Allows the owner to add addresse that can bypass the transfer lock.
    **/
    function whitelist(address _address) onlyOwner public {
        require(_address != 0x0);
        whitelisted[_address] = true;
    }

    /**
      @dev Allows the owner to remove addresse that can bypass the transfer lock.
    **/
    function restrict(address _address) onlyOwner public {
        require(_address != 0x0);
        whitelisted[_address] = false;
    }


    /** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * @dev Strandard transferts overloaded API
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/

    function transfer(address _to, uint256 _value) public canTransfert returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public canTransfert returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

  /**
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. We recommend to use use increaseApproval
   * and decreaseApproval functions instead !
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263555598
   */
    function approve(address _spender, uint256 _value) public canTransfert returns (bool) {
        return super.approve(_spender, _value);
    }

    function increaseApproval(address _spender, uint _addedValue) public canTransfert returns (bool success) {
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public canTransfert returns (bool success) {
        return super.decreaseApproval(_spender, _subtractedValue);
    }
}
