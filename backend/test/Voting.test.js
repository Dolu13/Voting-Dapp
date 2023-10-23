const { assert } = require("chai");

describe("Voting Contract", function () {
  let Voting;
  let voting;
  let owner;
  let voter1;
  let voter2;
  let nonVoter;

  before(async () => {
    [owner, voter1, voter2, nonVoter] = await ethers.getSigners();

    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.deployed();
  });

  it("Should deploy the contract with the owner as the admin", async function () {
    assert.equal(await voting.admin(), owner.address, "Admin address is not as expected");
  });

  it("Should start at InscriptionVotants status", async function () {
    const status = await voting.statut();
    assert.equal(status, 0, "Initial status is not InscriptionVotants");
  });

  it("Should allow the owner to register voters", async function () {
    await voting.enregistrerElecteurs(voter1.address);
    await voting.enregistrerElecteurs(voter2.address);
    assert.isTrue((await voting.voters(voter1.address)).isRegistered, "Voter1 was not registered");
    assert.isTrue((await voting.voters(voter2.address)).isRegistered, "Voter2 was not registered");
  });

  it("Should not allow non-admin to start the proposal registration", async function () {
    await assert.isRejected(voting.connect(voter1).debutPropositionsInscription(), "Seul l'admin peut faire ca");
  });

  it("Should allow the owner to start the proposal registration", async function () {
    await voting.debutPropositionsInscription();
    const status = await voting.statut();
    assert.equal(status, 1, "Status is not PropositionInscriptionStart");
  });

  it("Should allow registered voters to register proposals", async function () {
    await voting.connect(voter1).enregistrerProposition("Proposal 1");
    await voting.connect(voter2).enregistrerProposition("Proposal 2");
    const prop1 = await voting.propositions(0);
    const prop2 = await voting.propositions(1);
    assert.equal(prop1.description, "Proposal 1", "Proposal 1 was not registered");
    assert.equal(prop2.description, "Proposal 2", "Proposal 2 was not registered");
  });

  it("Should not allow unregistered users to vote", async function () {
    await assert.isRejected(voting.vote(0), "VM Exception while processing transaction: reverted with reason string 'Peux pas faire cette action ici");
  });

  it("Should allow the owner to end the proposal registration", async function () {
    await voting.finPropositionsInscription();
    const status = await voting.statut();
    assert.equal(status, 2, "Status is not PropositionInscriptionEnd");
  });

  it("Should not allow non-admin to start the voting session", async function () {
    await assert.isRejected(voting.connect(voter1).debutSessionVote(), "Seul l'admin peut faire ca");
  });

  it("Should allow the owner to start the voting session", async function () {
    await voting.debutSessionVote();
    const status = await voting.statut();
    assert.equal(status, 3, "Status is not SessionDeVoteStart");
  });

  it("Should not allow unregistered users to vote in the voting session", async function () {
    await assert.isRejected(voting.vote(0), "Les voteurs enregistres qui ont peuvent voter");
  });

  it("Should allow registered voters to vote in the voting session", async function () {
    await voting.connect(voter1).vote(1);
    const voter1HasVoted = (await voting.voters(voter1.address)).hasVoted;
    assert.isTrue(voter1HasVoted, "Voter1 was not allowed to vote");
  });
});