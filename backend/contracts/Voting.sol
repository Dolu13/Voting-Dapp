// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        InscriptionVotants,
        PropositionInscriptionStart,
        PropositionInscriptionEnd,
        SessionDeVoteStart,
        SessionDeVoteEnd,
        VotesComptabilises
    }

   
    address public admin;
    WorkflowStatus public statut;
    mapping(address => Voter) public voters;
    Proposal[] public propositions;
    uint public propositionGagnantId;

    
    event ElecteurInscrit(address voterAddress);
    event StatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event EnregistrementProposition(uint proposalId);
    event Voted(address voter, uint proposalId);

    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Seul l'admin peut faire ca");
        _;
    }


    modifier atStatus(WorkflowStatus _status) {
        require(statut == _status, "Peux pas faire cette action ici");
        _;
    }

    constructor() {
        admin = msg.sender;
        statut = WorkflowStatus.InscriptionVotants;
    }

    function enregistrerElecteurs(address _voter) external onlyAdmin atStatus(WorkflowStatus.InscriptionVotants) {
        require(!voters[_voter].isRegistered, "Voteur deja enregistre");

        voters[_voter] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedProposalId: 0
        });

        emit ElecteurInscrit(_voter);
    }

    function debutPropositionsInscription() external onlyAdmin atStatus(WorkflowStatus.InscriptionVotants) {
        statut = WorkflowStatus.PropositionInscriptionStart;
        emit StatusChange(WorkflowStatus.InscriptionVotants, WorkflowStatus.PropositionInscriptionStart);
    }

    function enregistrerProposition(string calldata _description) external atStatus(WorkflowStatus.PropositionInscriptionStart) {
        require(voters[msg.sender].isRegistered && !voters[msg.sender].hasVoted, "Seul ceux qui sont sur la liste des electeurs peuvent faire ca");

        propositions.push(Proposal({
            description: _description,
            voteCount: 0
        }));

        emit EnregistrementProposition(propositions.length - 1);
    }

    function finPropositionsInscription() external onlyAdmin atStatus(WorkflowStatus.PropositionInscriptionStart) {
        statut = WorkflowStatus.PropositionInscriptionEnd;
        emit StatusChange(WorkflowStatus.PropositionInscriptionStart, WorkflowStatus.PropositionInscriptionEnd);
    }

    function debutSessionVote() external onlyAdmin atStatus(WorkflowStatus.PropositionInscriptionEnd) {
        statut = WorkflowStatus.SessionDeVoteStart;
        emit StatusChange(WorkflowStatus.PropositionInscriptionEnd, WorkflowStatus.SessionDeVoteStart);
    }

    function vote(uint _proposalId) external atStatus(WorkflowStatus.SessionDeVoteStart) {
        require(voters[msg.sender].isRegistered && !voters[msg.sender].hasVoted, "Les voteurs enregistres qui ont peuvent voter");
        require(_proposalId < propositions.length, "Invalid proposal ID");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        propositions[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId);
    }

    function FinSessionVote() external onlyAdmin atStatus(WorkflowStatus.SessionDeVoteStart) {
        statut = WorkflowStatus.SessionDeVoteEnd;
        emit StatusChange(WorkflowStatus.SessionDeVoteStart, WorkflowStatus.SessionDeVoteEnd);
    }

    function CompterVotes() external onlyAdmin atStatus(WorkflowStatus.SessionDeVoteEnd) {
        uint winningVoteCount = 0;

        for (uint i = 0; i < propositions.length; i++) {
            if (propositions[i].voteCount > winningVoteCount) {
                winningVoteCount = propositions[i].voteCount;
                propositionGagnantId = i;
            }
        }
        statut = WorkflowStatus.VotesComptabilises;
        emit StatusChange(WorkflowStatus.SessionDeVoteEnd, WorkflowStatus.VotesComptabilises);
    }

    function getWinner() external view returns (string memory) {
        require(statut == WorkflowStatus.VotesComptabilises, "Les votes ne sont pas encore comptabilises");
        return propositions[propositionGagnantId].description;
    }
}
