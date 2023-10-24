import { Flex, Input, Text, CircularProgress, Button, Heading, Alert, AlertIcon, useToast, Card, List, CardBody, Select, ListItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody
    ,Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";

import { useState, useEffect } from "react";
import { useAccount, useProvider, useSigner } from 'wagmi'
import Contract from '../../../backend/artifacts/contracts/Voting.sol/Voting.json'
import { ethers } from "ethers";

const Main = () => {
    const { address, isConnected } = useAccount();
    const provider = useProvider();
    const { data: signer } = useSigner();
    const toast = useToast();

    const [isAdmin, setIsAdmin] = useState(false);  
    const [contractInstance, setContractInstance] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [voterAddress, setVoterAddress] = useState('');
    const [registeredVoters, setRegisteredVoters] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(0);
    const [winner, setWinner] = useState(null);
    const [propositions, setPropositions] = useState([]);
    const [adminAddress, setAdminAddress] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [ping, setPing] = useState(false);
    const [tempPropositionDescription, setTempPropositionDescription] = useState(''); 

    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";


    useEffect(() => {
        if (isConnected) {
            const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
            getContractData();
            checkAdmin();
            setContractInstance(contract);
            getBlockchainAccounts();
            getCurrentStatus();
            if (propositions.length > 0) {
                localStorage.setItem("propositions", JSON.stringify(propositions));
            }
            const savedPropositions = localStorage.getItem("propositions");
            if (savedPropositions) {
                setPropositions(JSON.parse(savedPropositions));
            }
            if (registeredVoters.length > 0) {
                localStorage.setItem("electeurs", JSON.stringify(registeredVoters));
            }
            const savedElecteurs = localStorage.getItem("electeurs");
            if (savedElecteurs) {
                setRegisteredVoters(JSON.parse(savedElecteurs));
            }
        }
    }, [address, currentStatus, isConnected, isAdmin, ping, winner]);

    const getCurrentStatus = async () => {
        const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
        const status = await contract.statut();
        setCurrentStatus(status);
    };

    const checkAdmin = async () => {
        try {
            const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
            const adminAddress = await contract.admin();
            if (adminAddress.toLowerCase() === address.toLowerCase()) {
                setIsAdmin(true);
                setAdminAddress(adminAddress);
            }else{
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("Error checking admin:", error);
        }
    };

    const getContractData = async () => {
        try {
            const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
        } catch (error) {
            console.error("Error fetching contract data:", error);
        }
    };


    const startProposalRegistration = async () => {
        if (contractInstance) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const transaction = await contract.debutPropositionsInscription();
                transaction.wait(1);
                setPing(!ping);
                console.log("La fonction debutPropositionsInscription a été appelée avec succès.");
            } catch (error) {
                console.error("Erreur lors de l'appel à la fonction debutPropositionsInscription:", error);
            }
        }
    };

    const enregistrementElecteurs = async () =>{
        if (voterAddress) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const transaction = await contract.enregistrerElecteurs(voterAddress);
                await transaction.wait();
                setRegisteredVoters([...registeredVoters, voterAddress]);
                console.log('electeur  enregistré :',{voterAddress});
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement de l\'électeur :', error);
            }
        }
    }

    const stopProposalRegistration = async () =>{
        if (contractInstance) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const transaction = await contract.finPropositionsInscription();
                transaction.wait(1);
                setPing(!ping);
                console.log("La fonction finPropositionsInscription a été appelée avec succès.");
            } catch (error) {
                console.error("Erreur lors de l'appel à la fonction finPropositionsInscription:", error);
            }
        }
    }

    const enregistrerProposition = async () => {
        if (contractInstance) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const transaction = await contract.enregistrerProposition(tempPropositionDescription);
                await transaction.wait();
                console.log('Proposition enregistrée avec succès :', tempPropositionDescription);
                setPropositions([...propositions, tempPropositionDescription]);
                setTempPropositionDescription(''); 
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement de la proposition :', error);
            }
        }
    };

    const startVotingSession = async () => {
        if (contractInstance) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const transaction = await contract.debutSessionVote();
                await transaction.wait();
                setPing(!ping);
                console.log('Début de session enregistrée avec succès.');
            } catch (error) {
                console.error('Erreur lors du lancement de la session de vote', error);
            }
        }
    }

    const voting = async () => {
        if (contractInstance) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const transaction = await contract.vote(selectedProposal);
                console.log('Vote enregistré avec succès.');
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement du vote :', error);
            }
        }
    }

    const stopVotingSession = async () => {
        if (contractInstance) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const transaction = await contract.FinSessionVote();
                await transaction.wait();
                setPing(!ping);
                console.log('Fin de session enregistrée avec succès.');
            } catch (error) {
                console.error('Erreur lors de la fin de session de vote', error);
            }
        }
    }
    const votingCount = async () => {
        if (contractInstance) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const transaction = await contract.CompterVotes();
                setPing(!ping);
                console.log('Vote Comptabilisé avec succès.');
            } catch (error) {
                console.error('Erreur lors de la récupération du gagnant :', error);
            }
        }
    }
    const getWinner = async () => {
        if (contractInstance) {
            try {
                const contract = new ethers.Contract(contractAddress, Contract.abi, signer);
                const winner = await contract.getWinner();
                console.log('Le gagnant est :', winner);
                setWinner(winner);
            } catch (error) {
            }
        }
    };
    const clear = () => {
        localStorage.removeItem("propositions");
        setPropositions([]);
        localStorage.removeItem("electeurs");
        setRegisteredVoters([]);
        setWinner(null);
        console.log('localStorage cleared but not smart contract :/');
    };

    const getBlockchainAccounts = async () => {
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
      
        try {
          const accounts = await provider.listAccounts();
          setAccounts(accounts);
        } catch (error) {
          console.error('Erreur lors de la récupération des comptes :', error);
          return [];
        }
      };

      const handleChange = (event) => setTempPropositionDescription(event.target.value);

    const TabContent = () => {
        return (
        <Flex
            p="2rem"
            justifyContent="center"
            alignItems="center"
            height="85vh"
        >
                <Flex direction="column" width="100%" height="100%">
                    <Text mt={2} fontSize="xl" fontWeight="semibold" lineHeight="short">
                        Etapes du processus de vote : {currentStatus}/5
                    </Text>
                    <CircularProgress value={currentStatus*10*2} />
                    {(isAdmin && currentStatus === 0) &&(
                        <Card p="2rem" mt="2rem">
                            <Heading  as="h2" size="xl" align="center">Enregistrement des electeurs</Heading>
                            <CardBody>
                                 <Select m={2} value={voterAddress} onChange={(e) => setVoterAddress(e.target.value)}>
                                    {accounts.map((address) => (
                                        <option key={address} value={address}>{address}</option>
                                    ))}
                                </Select>
                                <Button m={2} onClick={enregistrementElecteurs}>Enregistrer un nouvel electeur</Button>
                                <Text mt={2} fontSize="xl" fontWeight="semibold" lineHeight="short">Électeurs déja enregistrés :</Text>
                                <List spacing={4}>
                                    {registeredVoters.map((address) => (
                                    <ListItem key={address}>{address}</ListItem>
                                    ))}
                                </List>
                            </CardBody>
                        </Card>
                    )}
                    {(isAdmin && currentStatus === 0)&&(
                        <Card p="2rem" mt="2rem">
                            <Heading as="h2" size="xl" align="center">Proposition d'inscription</Heading>
                            <CardBody>
                                <Button m={2} width="100%" mt="1rem" colorScheme="green" onClick={() => {startProposalRegistration(); getCurrentStatus();}}>Démarrer la proposition d'inscription</Button>
                            </CardBody> 
                        </Card>
                    )}
                    {(currentStatus === 1) &&(
                        <Card p="2rem" mt="2rem">
                            <Heading as="h2" size="xl" align="center">Enregistrer une proposition</Heading>
                            <CardBody>
                            <Input
                                m={2}
                                type="text"
                                placeholder="Description de la proposition"
                                value={tempPropositionDescription}
                                onChange={handleChange}
                            />
                                <Button m={2} onClick={enregistrerProposition}>Enregistrer une nouvelle proposition de candidats</Button>
                                <Text mt={2} fontSize="xl" fontWeight="semibold" lineHeight="short">Propositions déja enregistrées :</Text>
                                <List spacing={4}>
                                    {propositions.map((proposition) => (
                                    <ListItem key={proposition}>{proposition}</ListItem>
                                    ))}
                                </List>
                            </CardBody> 
                        </Card>
                    )}
                    {(isAdmin && currentStatus === 1) &&(
                        <Card p="2rem" mt="2rem">
                            <Heading as="h2" size="xl" align="center">Proposition d'inscription</Heading>
                            <CardBody>
                                <Button m={2} width="100%" mt="1rem" colorScheme="red" onClick={() => {stopProposalRegistration(); getCurrentStatus();}}>Stopper la proposition d'inscription</Button>
                            </CardBody> 
                        </Card>
                    )}
                    {(isAdmin && currentStatus === 2) &&(
                        <Card p="2rem" mt="2rem">
                            <Heading as="h2" size="xl" align="center">Session de vote</Heading>
                            <CardBody>
                                <Button m={2} width="100%" mt="1rem" colorScheme="green" onClick={() => {startVotingSession(); getCurrentStatus();}}>Démarrer la session de vote</Button>
                            </CardBody> 
                        </Card>
                    )}
                    {(currentStatus === 3) &&(
                        <Card p="2rem" mt="2rem">
                            <Heading  as="h2" size="xl" align="center">Voter pour un candidat</Heading>
                            <CardBody>
                            <Select m={2} value={selectedProposal} onChange={(e) => setSelectedProposal(Number(e.target.value))}>
                            {propositions.map((proposition, index) => (
                                <option key={index} value={index}>{proposition}</option>
                            ))}
                            </Select>
                            <Button m={2} width="100%" mt="1rem"  onClick={voting}>Voter</Button>
                            </CardBody>
                        </Card>
                    )}
                    {(isAdmin && currentStatus === 3) &&(
                        <Card p="2rem" mt="2rem">
                            <Heading as="h2" size="xl" align="center">Session de vote</Heading>
                            <CardBody>
                                <Button width="100%" mt="1rem" colorScheme="red" onClick={() => {stopVotingSession(); getCurrentStatus();}}>Stopper la session de vote</Button>
                            </CardBody> 
                        </Card>
                    )}
                    {(isAdmin && currentStatus === 4) &&(
                        <Card p="2rem" mt="2rem">
                            <Heading  as="h2" size="xl" align="center">Comptabiliser le nombre de vote</Heading>
                            <CardBody>
                            <Button m={2} width="100%" mt="1rem"   onClick={() => {votingCount(); getCurrentStatus();}}>Comptabiliser</Button>
                            </CardBody> 
                        </Card>
                    )}
                    {(currentStatus === 5) &&(
                        <Card p="2rem" mt="2rem">
                            <CardBody>
                                    <Heading as="h2" size="xl" align="center">Découvrir le Gagnant du vote</Heading>
                                    <Popover placement='top-start'>
                                    <PopoverTrigger>
                                        <Button m={2} width="100%" onClick={getWinner} mt="1rem">Obtenir le gagnant</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverHeader fontWeight='semibold'>Le gagnant est : {winner}</PopoverHeader>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody>
                                        On ne sait malheuresement pas encore combien de personnes ont votés pour toi 
                                        Maybe soon...
                                        </PopoverBody>
                                    </PopoverContent>
                                    </Popover>
                            </CardBody> 
                        </Card>
                    )}
                    {(currentStatus === 5) &&(
                        <Card p="2rem" mt="2rem">
                            <Heading  as="h2" size="xl" align="center">Clear</Heading>
                            <CardBody>
                            <Button m={2} width="100%" mt="1rem"   onClick={clear}>clear</Button>
                            </CardBody> 
                        </Card>
                    )}
                </Flex>
        </Flex>
    );
    }

    return (
        <>
        {isConnected ?(
        <Tabs isFitted variant='enclosed'>
                    <TabList mb='1em'>
                        <Tab isDisabled={adminAddress.toLowerCase() !== address.toLowerCase()}>Admin</Tab>
                        <Tab isDisabled={adminAddress.toLowerCase() === address.toLowerCase()}>User</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <TabContent />
                        </TabPanel>
                        <TabPanel>
                            <TabContent/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
        ) : (
            <Alert status="warning">
                <AlertIcon />
                Veuillez vous connecter à votre portefeuille.
            </Alert>
        )}
        </>
)};

export default Main;