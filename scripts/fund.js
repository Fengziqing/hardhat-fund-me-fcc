const { getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding contract...")
    const fundResponse = await fundMe.fund({ value: ethers.parseEther("0.1") })
    await fundResponse.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
