const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let sendValue = "1000000000000000"
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allow people to fund", async () => {
              const fundResponse = await fundMe.fund({ value: sendValue })
              await fundResponse.wait(1)
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target
              )
              assert.equal(endingBalance.toString(), sendValue.toString())
          })

          it("allow people to fund and wtihdraw", async () => {
              const transactionResponse = await fundMe.withdraw({
                  gasLimit: 3000000,
              })
              await transactionResponse.wait(1)

              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
