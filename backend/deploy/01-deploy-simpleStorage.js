const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
    
module.exports = async({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("--------------------------------------")
    arguments = [] 
    const Voting = await deploy("Voting", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
}

module.exports.tags = ["all", "voting", "main"]