const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let MockV3Aggregator
          let sendValue = ethers.parseEther("1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture("all")
              fundMe = await ethers.getContract("FundMe", deployer)
              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async () => {
              it("set the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, MockV3Aggregator.target)
              })
          })

          describe("fund", async () => {
              it("failed if you dont send enough eth", async () => {
                  expect(fundMe.fund()).to.be.revertedWith(
                      "Do not have enough eth"
                  )
              })

              it("updated the ammount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("adds funedr to array of getFunders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunders(0)
                  assert.equal(response, deployer)
              })
          })

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw eth from a single founder", async () => {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingdeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionRecipt
                  const gasFee = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingdeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance.toString(), 0)
                  assert.equal(
                      (
                          startingFundMeBalance + startingdeployerBalance
                      ).toString(),
                      (endingdeployerBalance + gasFee).toString()
                  )
              })

              it("allow us to withdraw with mutiple getFunders", async () => {
                  //得到这个contract的所有资助者
                  const accounts = await ethers.getSigners()
                  //第0个是创建者 所以从第一个开始fund
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingdeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionRecipt
                  const gasFee = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingdeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance.toString(), 0)
                  assert.equal(
                      (
                          startingFundMeBalance + startingdeployerBalance
                      ).toString(),
                      (endingdeployerBalance + gasFee).toString()
                  )

                  await expect(fundMe.fund(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(accounts[i]),
                          0
                      )
                  }
              })

              it("cheaperWithdraw eth from a single founder", async () => {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingdeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionRecipt
                  const gasFee = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingdeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance.toString(), 0)
                  assert.equal(
                      (
                          startingFundMeBalance + startingdeployerBalance
                      ).toString(),
                      (endingdeployerBalance + gasFee).toString()
                  )
              })

              it("only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const attacter = accounts[1]
                  const attacerConnetction = await fundMe.connect(attacter)
                  await expect(
                      attacerConnetction.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("cheaper withdraw testing ... ", async () => {
                  //得到这个contract的所有资助者
                  const accounts = await ethers.getSigners()
                  //第0个是创建者 所以从第一个开始fund
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingdeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionRecipt
                  const gasFee = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingdeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance.toString(), 0)
                  assert.equal(
                      (
                          startingFundMeBalance + startingdeployerBalance
                      ).toString(),
                      (endingdeployerBalance + gasFee).toString()
                  )

                  await expect(fundMe.fund(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(accounts[i]),
                          0
                      )
                  }
              })
          })
      })
