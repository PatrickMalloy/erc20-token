// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EasyWayToken is ERC20Capped, ERC20Burnable, Ownable {

  // Max Capped Supply of 1 Billion Tokens
  // Initial Mint Supply of 100 Million tokens
  constructor(address initialOwner, uint256 _maxSupply)
    ERC20("EasyWayToken", "EWT") 
    Ownable(initialOwner)
    ERC20Capped(_maxSupply * 10 ** decimals())
    {
      _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }

  function mint(address to, uint256 value) public onlyOwner {
      require(totalSupply() + value <= cap(), "Exceeds maximum supply");
      _mint(to, value);
  }

  function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Capped) {
    super._update(from, to, value);
  }
}
