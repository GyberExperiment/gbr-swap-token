const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GBRTokenSwap", function () {
  let GBRTokenSwap, gbrTokenSwap, USDTToken, usdtToken, GBRToken, gbrToken, owner, addr1, addr2;

  beforeEach(async function () {
    // Deploy USDTToken mock
    const USDTTokenMock = await ethers.getContractFactory("ERC20Mock");
    [owner, addr1, addr2] = await ethers.getSigners();
    usdtToken = await USDTTokenMock.deploy("USDT Token", "USDT", owner.address, ethers.utils.parseEther("10000"));

    // Deploy GBRToken mock
    const GBRTokenMock = await ethers.getContractFactory("ERC20Mock");
    gbrToken = await GBRTokenMock.deploy("GBR Token", "GBR", owner.address, ethers.utils.parseEther("1000000000000"));

    // Deploy GBRTokenSwap
    GBRTokenSwap = await ethers.getContractFactory("GBRTokenSwap");
    gbrTokenSwap = await GBRTokenSwap.deploy(usdtToken.address, gbrToken.address);

    // Take GBR & USDT Tokens to GBR Token Swap Contract
    await usdtToken.connect(owner).transfer(gbrTokenSwap.address, ethers.utils.parseEther("1000"))
    await gbrToken.connect(owner).transfer(gbrTokenSwap.address, ethers.utils.parseEther("100000000000"))
  });

  it("Should set the correct owner", async function () {
    expect(await gbrTokenSwap.owner()).to.equal(owner.address);
  });

  it("Should set the correct USDT and GBR token addresses", async function () {
    expect(await gbrTokenSwap.usdtToken()).to.equal(usdtToken.address);
    expect(await gbrTokenSwap.gbrToken()).to.equal(gbrToken.address);
  });

  it("Should successfully swap USDT to GBR tokens", async function () {
    // Approve USDT transfer
    await usdtToken.connect(addr1).approve(gbrTokenSwap.address, ethers.utils.parseEther("10"));
    await usdtToken.connect(owner).transfer(addr1.address, ethers.utils.parseEther("10"));

    // Swap USDT for GBR
    await gbrTokenSwap.connect(addr1).swap(ethers.utils.parseEther("10"));

    // Check GBR balance
    expect(await gbrToken.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("100000000"));
  });

  it("Should allow owner to withdraw tokens", async function () {
    await gbrTokenSwap.withdrawTokens(usdtToken.address, addr2.address, ethers.utils.parseEther("100"));

    // Check USDT balance
    expect(await usdtToken.balanceOf(addr2.address)).to.equal(ethers.utils.parseEther("100"));
  });

  it("Should allow owner to set a new owner", async function () {
    await gbrTokenSwap.setOwner(addr1.address);

    // Check new owner
    expect(await gbrTokenSwap.owner()).to.equal(addr1.address);
  });

  it("Should revert when non-owner tries to withdraw tokens", async function () {
    await expect(
      gbrTokenSwap.connect(addr1).withdrawTokens(usdtToken.address, addr1.address, ethers.utils.parseEther("100"))
    ).to.be.revertedWith("Only contract owner can call this function");
  });

  it("Should revert when non-owner tries to set a new owner", async function () {
    await expect(gbrTokenSwap.connect(addr1).setOwner(addr1.address)).to.be.revertedWith(
      "Only contract owner can call this function"
    );
  });
});
