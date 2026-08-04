// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
  function totalSupply() external view returns (uint256 supply);
  function balanceOf(address _owner) external view returns (uint256 balance);
  function transfer(address _to, uint256 _value) external returns (bool success);
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
  function approve(address _spender, uint256 _value) external returns (bool success);
  function allowance(address _owner, address _spender) external view returns (uint256 remaining);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract HardWayToken is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public _totalSupply;
    uint256 private immutable _maxSupply;  // Maximum supply of tokens
    address public owner;  // Address of the token contract owner

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowance;

    //event Transfer(address indexed from, address indexed to, uint256 value);
    //event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);

    /**
     * @dev Sets the values for {initialSupply} and {maxSupply}.
     *
     * maxSupply value is immutable: it can only be set once during
     * construction.
     */
    constructor(uint256 initialSupply, uint256 maxSupply) {
      require(initialSupply <= maxSupply, "ERROR: initialSupply must be <= maxSupply!");
      name = "HardWayToken";
      symbol = "HWT";
      decimals = 18;  // Consistent with ETH
      owner = msg.sender;
      _totalSupply = initialSupply;  
      balances[owner] = _totalSupply; // The total supply is initially owned by owner
      _maxSupply = maxSupply;
      emit Transfer(address(0), owner, _totalSupply);
    }

    function totalSupply() public view returns (uint256) {
      return _totalSupply;
    }

    function maximumSupply() public view returns (uint256) {
      return _maxSupply;
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
        require(balances[msg.sender] >= value, "ERC20: insufficient balance");

        address from = msg.sender;

        //balances[from] -= value;
        //balances[to] += value;

        //emit Transfer(from, to, value);

        _transfer(from, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        require(value <= balances[from], "ERC20: insufficient balance");
        require(value <= allowance[from][msg.sender], "ERC20: insufficient allowance");

        allowance[from][msg.sender] -= value;
        //balances[from] -= value;
        //balances[to] += value;

        //emit Transfer(from, to, value);
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal returns (bool) {
      balances[from] -= value;
      balances[to] += value;

      emit Transfer(from, to, value);
      return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0), "Need a valid spender");

        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
}
