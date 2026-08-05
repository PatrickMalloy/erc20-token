const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("HardWayToken", function () {
  // Define a fixture to reuse the same setup in every test.
  // Use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployHWTFixture() {
    const initialSupply = hre.ethers.parseEther("100000000");
    const maxSupply = hre.ethers.parseEther("1000000000");

    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2] = await ethers.getSigners();

    const hwt = await hre.ethers.deployContract("HardWayToken", [initialSupply, maxSupply]);
    await hwt.waitForDeployment();

    return { hwt, owner, account1, account2, initialSupply, maxSupply };
  }

  describe("Deployment", function () {
    it("Should set the right total supply to initial supply", async function () {
      const { hwt, initialSupply } = await loadFixture(deployHWTFixture);

      expect(await hwt.totalSupply()).to.equal(initialSupply);
    });

    it("Should set the right owner", async function () {
      const { hwt, owner } = await loadFixture(deployHWTFixture);

      expect(await hwt.owner()).to.equal(owner.address);
    });

    it("Should set the right initial supply to owner", async function () {
      const { hwt, owner, initialSupply } = await loadFixture(deployHWTFixture);

      expect(await hwt.balanceOf(owner)).to.equal(initialSupply);
    });

    it("Should set the correct max supply", async function () {
      const { hwt, maxSupply } = await loadFixture(deployHWTFixture);

      expect(await hwt.maximumSupply()).to.equal(maxSupply);
    });

    it("Should emit a Transfer event on deployment", async function () {
      const { hwt, owner, initialSupply } = await loadFixture(deployHWTFixture);

      await expect(hwt.deploymentTransaction())
        .to.emit(hwt, "Transfer")
        .withArgs(ethers.ZeroAddress, owner.address, initialSupply);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens and update balances", async function () {
      const { hwt, owner, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await hwt.transfer(account1.address, amount);

      expect(await hwt.balanceOf(account1)).to.equal(amount);
      expect(await hwt.balanceOf(owner)).to.equal(
        (await hwt.totalSupply()) - amount
      );
    });

    it("Should emit a Transfer event", async function () {
      const { hwt, owner, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await expect(hwt.transfer(account1.address, amount))
        .to.emit(hwt, "Transfer")
        .withArgs(owner.address, account1.address, amount);
    });

    it("Should revert if transferring to the zero address", async function () {
      const { hwt, owner } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await expect(
        hwt.transfer(ethers.ZeroAddress, amount)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should revert if the sender does not have enough balance", async function () {
      const { hwt, owner, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1");

      await expect(
        hwt.connect(account1).transfer(owner.address, amount)
      ).to.be.revertedWith("ERC20: insufficient balance");
    });

    it("Should transfer tokens via transferFrom", async function () {
      const { hwt, owner, account1, account2 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await hwt.approve(account1.address, amount);
      await hwt.connect(account1).transferFrom(owner.address, account2.address, amount);

      expect(await hwt.balanceOf(account2)).to.equal(amount);
      expect(await hwt.balanceOf(owner)).to.equal(
        (await hwt.totalSupply()) - amount
      );
    });

    it("Should reduce the allowance after a transferFrom", async function () {
      const { hwt, owner, account1, account2 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await hwt.approve(account1.address, amount);
      await hwt.connect(account1).transferFrom(owner.address, account2.address, amount);

      expect(await hwt.allowance(owner, account1)).to.equal(0);
    });

    it("Should emit a Transfer event on transferFrom", async function () {
      const { hwt, owner, account1, account2 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await hwt.approve(account1.address, amount);

      await expect(
        hwt.connect(account1).transferFrom(owner.address, account2.address, amount)
      )
        .to.emit(hwt, "Transfer")
        .withArgs(owner.address, account2.address, amount);
    });

    it("Should revert on transferFrom if allowance is insufficient", async function () {
      const { hwt, owner, account1, account2 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await hwt.approve(account1.address, hre.ethers.parseEther("500"));

      await expect(
        hwt.connect(account1).transferFrom(owner.address, account2.address, amount)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should revert on transferFrom to the zero address", async function () {
      const { hwt, owner, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await hwt.approve(account1.address, amount);

      await expect(
        hwt.connect(account1).transferFrom(owner.address, ethers.ZeroAddress, amount)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });
  });

  describe("Approvals", function () {
    it("Should set the right allowance", async function () {
      const { hwt, owner, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await hwt.approve(account1.address, amount);

      expect(await hwt.allowance(owner, account1)).to.equal(amount);
    });

    it("Should emit an Approval event", async function () {
      const { hwt, owner, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await expect(hwt.approve(account1.address, amount))
        .to.emit(hwt, "Approval")
        .withArgs(owner.address, account1.address, amount);
    });

    it("Should revert if approving the zero address as spender", async function () {
      const { hwt, owner } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await expect(
        hwt.approve(ethers.ZeroAddress, amount)
      ).to.be.revertedWith("Need a valid spender");
    });
  });

  describe("Minting", function () {
    it("Should mint tokens and increase total supply", async function () {
      const { hwt, owner, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");
      const initialSupply = await hwt.totalSupply();

      await hwt.mint(account1.address, amount);

      expect(await hwt.balanceOf(account1)).to.equal(amount);
      expect(await hwt.totalSupply()).to.equal(initialSupply + amount);
    });

    it("Should emit a Mint event", async function () {
      const { hwt, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await expect(hwt.mint(account1.address, amount))
        .to.emit(hwt, "Mint")
        .withArgs(account1.address, amount);
    });

    it("Should revert if it would exceed the max supply", async function () {
      const { hwt, owner, maxSupply } = await loadFixture(deployHWTFixture);
      const amount = maxSupply - (await hwt.totalSupply()) + 1n;

      await expect(
        hwt.mint(owner.address, amount)
      ).to.be.revertedWith("Exceeds maximum supply");
    });

    it("Should revert if called by a non-owner", async function () {
      const { hwt, account1 } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await expect(
        hwt.connect(account1).mint(account1.address, amount)
      ).to.be.revertedWith("Only the owner can call this function.");
    });

    it("Should revert if mint value is zero", async function () {
      const { hwt, owner } = await loadFixture(deployHWTFixture);

      await expect(
        hwt.mint(owner.address, 0)
      ).to.be.revertedWith("Mint value must be greater than 0");
    });
  });

  describe("Burning", function () {
    it("Should burn tokens and decrease total supply", async function () {
      const { hwt, owner } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");
      const initialSupply = await hwt.totalSupply();

      await hwt.burn(amount);

      expect(await hwt.balanceOf(owner)).to.equal(initialSupply - amount);
      expect(await hwt.totalSupply()).to.equal(initialSupply - amount);
    });

    it("Should emit a Burn event", async function () {
      const { hwt, owner } = await loadFixture(deployHWTFixture);
      const amount = hre.ethers.parseEther("1000");

      await expect(hwt.burn(amount))
        .to.emit(hwt, "Burn")
        .withArgs(owner.address, amount);
    });

    it("Should revert if burning more than the balance", async function () {
      const { hwt, owner, initialSupply } = await loadFixture(deployHWTFixture);

      await expect(
        hwt.burn(initialSupply + 1n)
      ).to.be.revertedWith("Burn value exceeds balance");
    });

    it("Should revert if burn value is zero", async function () {
      const { hwt, owner } = await loadFixture(deployHWTFixture);

      await expect(
        hwt.burn(0)
      ).to.be.revertedWith("Burn value must be greater than 0");
    });
  });
});
