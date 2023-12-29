// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ERC20Interface {
  function totalSupply() external view returns (uint256 supply);
  function balanceOf(address _owner) external view returns (uint256 balance);
  function transfer(address _to, uint256 _value) external returns (bool success);
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
  function approve(address _spender, uint256 _value) external returns (bool success);
  function allowance(address _owner, address _spender) external view returns (uint256 remaining);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract HardWayToken is ERC20Interface {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public _totalSupply;
    uint256 private immutable _maxSupply;  // Maximum supply of tokens
    address public owner;  // Address of the token contract owner

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowed;

    //event Transfer(address indexed from, address indexed to, uint256 value);
    //event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);

    constructor() {
        name = "HardWayToken";
        symbol = "HWT";
        decimals = 18;  // You can adjust the number of decimals according to your requirements
        owner = msg.sender;
        _maxSupply = 1_000_000_000 * 10 ** decimals; // Maximum supply is 1 billion tokens
        _totalSupply = 1_000_000;  // The total supply is initially set to 1 million tokens
        balances[owner] = _totalSupply;
        emit Transfer(address(0), owner, _totalSupply);
    }

    function totalSupply() public view returns (uint256) {
      return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function mint(address to, uint256 value) public onlyOwner returns (bool) {
        require(value > 0, "Mint value must be greater than 0");
        require(_totalSupply + value <= _maxSupply, "Exceeds maximum supply");

        // Increment total supply
        _totalSupply += value;

        // Increase balance of the recipient
        balances[to] += value;

        // Emit Mint event
        emit Mint(to, value);
        return true;
    }

    function burn(uint256 value) public returns (bool) {
        require(value > 0, "Burn value must be greater than 0");
        require(value <= balances[msg.sender], "Burn value exceeds balance");

        // Decrement total supply
        _totalSupply -= value;

        // Decrease balance of the burner
        balances[msg.sender] -= value;

        // Emit Burn event
        emit Burn(msg.sender, value);
        return true;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        require(value <= balances[msg.sender], "ERC20: insufficient balance");

        balances[msg.sender] -= value;
        balances[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        require(value <= balances[from], "ERC20: insufficient balance");
        require(value <= allowed[from][msg.sender], "ERC20: insufficient allowance");

        balances[from] -= value;
        balances[to] += value;
        allowed[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function allowance(address account, address spender) public view returns (uint256) {
        return allowed[account][spender];
    }
}
