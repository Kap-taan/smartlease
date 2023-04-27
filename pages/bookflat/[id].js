import { doc, getDoc, writeBatch, arrayUnion, increment, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import factory from '../../ethereum/factory';
import web3 from '@/ethereum/web3';
import { useContext, useEffect, useState } from 'react';
import { db } from '@/components/data/firebase';
import Layout from '@/components/Layout';
import AuthContext from '@/components/stores/AuthContext';
import { useRouter } from 'next/router';
import { Heading, Container, Card, CardBody, Center, Alert, AlertIcon, Tag, Spinner, Button, Flex, List, ListItem, ListIcon, AlertDescription, AlertTitle, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer, Stat, StatNumber, StatHelpText, StatLabel, StatArrow } from '@chakra-ui/react';
import { ChevronDownIcon, ArrowForwardIcon, CheckCircleIcon, RepeatIcon, CheckIcon } from '@chakra-ui/icons';
import Agreement from '../../ethereum/build/Agreement.json';
import Link from 'next/link';
import withAuth from '@/components/routes/PrivateRoute';

const BookFlat = () => {

    const router = useRouter();
    const { id } = router.query;

    const { user } = useContext(AuthContext);

    const { additionalInfo } = useContext(AuthContext);

    const [flatInfo, setFlatInfo] = useState();
    const [error, setError] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(9);

    const [steps, setSteps] = useState('');

    const getAppointFlatInfo = async () => {
        const response = await getDoc(doc(db, "appointed", id));
        if (response.exists()) {
            if (response.data().isVerified === true && response.data().isAppointed === false && response.data().isRejected === false) {
                setFlatInfo(response.data());
                console.log(response.data());
            } else {
                if (response.data().isVerified === false) {
                    setError('Approval is not verified');
                } else if (response.data().isAppointed === true) {
                    setError('Approval is already appointed')
                } else {
                    setError('Approval is already rejected');
                }
            }
        }
        else {
            setError('Approval id is not valid');
        }
        setInitialLoading(false);
    }

    const agreementHandler = async () => {
        // Chech whether the flat is already alloted or not
        setSteps('Process of Agreement creation is started');
        setError('');
        setLoading(true);
        const block = flatInfo.blockSelected;
        const floor = flatInfo.floorSelected;
        const room = flatInfo.roomSelected;
        const blockNo = flatInfo.blockNo;
        console.log(block, floor, room);
        // Get the information of the block
        const response = await getDoc(doc(db, "buildings", block));
        if (response.exists()) {
            const roomsData = response.data().rooms;
            console.log(flatInfo.agreementLimit);
            if (roomsData[floor].occupiedRooms.indexOf(room) === -1) {
                // Safe (not occupied)
                // can proceed further
                const date = new Date();
                date.setFullYear(date.getFullYear() + flatInfo.agreementLimit)
                const endDate = date.getTime();
                try {
                    const accounts = await web3.eth.getAccounts();
                    const response = await factory.methods.createAgreement("gQsectJNClWrpZ5bk8clvdGaOGZ2", "0x51e93DE0da219DF7A404B848DfC56a7F98412769", additionalInfo.name, endDate).send({
                        from: accounts[0]
                    })
                    const addresses = await factory.methods.getDeployedAgreements().call();
                    const address = addresses[addresses.length - 1];
                    console.log(address);
                    const instance = new web3.eth.Contract(
                        JSON.parse(Agreement.interface),
                        address
                    );
                    setSteps('Adding the information about the flat');
                    await instance.methods.addFlatInfo(room, blockNo, flatInfo.area, flatInfo.city, flatInfo.rent, flatInfo.securityAmount).send({
                        from: accounts[0]
                    })
                    setSteps('Pay the security ddeposit');
                    await instance.methods.paySecurityDeposit().send({
                        from: accounts[0],
                        value: flatInfo.securityAmount.toString(),
                    })
                    setSteps('Finalizing the process');
                    const batch = writeBatch(db);

                    const docRef1 = doc(db, "appointed", id);
                    batch.update(docRef1, {
                        isAppointed: true,
                        contractAddress: address
                    });

                    const docRef2 = doc(db, "users", user.uid);
                    batch.update(docRef2, {
                        rentedFlats: arrayUnion(id)
                    });

                    const docRef3 = doc(db, "buildings", block);
                    batch.update(docRef3, {
                        [`rooms.${floor}.occupiedRooms`]: arrayUnion(room),
                        [`typesOfFlats.${flatInfo.bhk}.${floor}`]: increment(1)
                    })

                    setTimeout(() => {
                        clearInterval(interval);
                        router.push('/rentedflats');
                    }, 10000)

                    const interval = setInterval(() => {
                        setTimer((prevTimerValue) => {
                            return prevTimerValue - 1;
                        })
                    }, 1000)

                    await batch.commit();
                } catch (error) {
                    setError(error.message);
                    console.log(error);
                }

                console.log('DONE');
            }
        } else {
            updateDoc(doc(db, "appointed", id), {
                isRejected: true
            })
            setError('Flat is already appointed to someone else :(');
        }

        setLoading(false);
    }

    useEffect(() => {
        getAppointFlatInfo();
    }, [])

    return (
        <Layout>
            <div className="mb-10">
                <div className="mb-5">
                    <Heading as='h3' size='lg'>Book a Flat</Heading>
                </div>
                {!initialLoading && error && <Container>
                    <Alert status='error'>
                        <AlertIcon />
                        {error}
                    </Alert>
                </Container>}
                {!initialLoading && flatInfo && !steps && <Container>
                    <Card>
                        <CardBody>
                            <Center mb={7}>
                                <Heading as='h3' size='lg'>
                                    Terms and Conditions
                                </Heading>
                            </Center>
                            {/* <Text>Selected society is <Tag>{flatInfo?.societyName}</Tag> and location is {flatInfo?.area?.toLocaleUpperCase()}, {flatInfo?.city?.toLocaleUpperCase()}</Text> */}
                            <List spacing={3}>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color='green.500' />
                                    The monthly rent is {flatInfo?.rent} wei and security deposit is {flatInfo?.securityAmount} wei and can be paid through ethereum wallet only.
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color='green.500' />
                                    Limit of agreement is {flatInfo?.agreementLimit} years
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color='green.500' />
                                    The landlord is responsible for maintaining the rental property in good condition, including repairs due to normal wear and tear. The tenant must notify the landlord of any damages or needed repairs in writing within 48 hours of the issue occurring.
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color='green.500' />
                                    The tenant is responsible for paying for all utilities, including electricity, gas, water, and internet.
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color='green.500' />
                                    No pets are allowed on the rental property.
                                </ListItem>
                            </List>
                        </CardBody>
                    </Card>
                </Container>}
                {initialLoading && <Center>
                    <Spinner size='xl' />
                </Center>}
            </div>
            {!initialLoading && flatInfo && <div>
                <Container>
                    {!steps && <Flex justifyContent='center'>
                        <Button onClick={agreementHandler} isDisabled={!!error} isLoading={loading} rightIcon={<ArrowForwardIcon />} colorScheme='blue' variant='outline'>
                            Start the Agreement Process
                        </Button>
                    </Flex>}
                    {steps && !loading && !error && <Alert
                        status='success'
                        variant='subtle'
                        flexDirection='column'
                        alignItems='center'
                        justifyContent='center'
                        textAlign='center'
                        height='200px'
                        mb={5}
                    >
                        <AlertIcon boxSize='40px' mr={0} />
                        <AlertTitle mt={4} mb={1} fontSize='lg'>
                            Flat is booked successfully
                        </AlertTitle>
                        {/* <AlertDescription maxWidth='sm'>
                            The agreement has been successfully created and stored on the blockchain
                        </AlertDescription> */}
                    </Alert>}
                    {steps && !loading && !error && <div className='flex flex-col justify-center items-center my-4'><Stat>
                        <StatLabel>Redirect in</StatLabel>
                        <StatNumber>{timer} seconds</StatNumber>
                    </Stat></div>}
                    {steps && !loading && !error && <TableContainer>
                        <Table variant='simple' w="100%">
                            <TableCaption>Information about Flat</TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>Name of society</Th>
                                    <Th>Block No.</Th>
                                    <Th>Floor No.</Th>
                                    <Th>Flat No.</Th>
                                    {/* <Th>City</Th> */}
                                    {/* <Th>Area</Th> */}
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>{flatInfo?.societyName}</Td>
                                    <Td>{flatInfo?.blockNo}</Td>
                                    <Td>{flatInfo?.floorSelected}</Td>
                                    <Td>{flatInfo?.roomSelected}</Td>
                                    {/* <Td>{flatInfo?.city}</Td> */}
                                    {/* <Td>{flatInfo?.area}</Td> */}
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>}
                    {steps && <Flex justifyContent='center'>
                        <Link href="/rentedflats"><Button isLoading={loading} loadingText={steps} rightIcon={<CheckIcon />} colorScheme='green' variant='outline'>
                            Done
                        </Button>
                        </Link>
                    </Flex>}
                </Container>
            </div>}
        </Layout>
    );
}

export default withAuth(BookFlat);