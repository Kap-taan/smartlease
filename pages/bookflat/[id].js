import { doc, getDoc } from 'firebase/firestore';
import factory from '../../ethereum/factory';
import web3 from '@/ethereum/web3';
import { useContext, useEffect, useState } from 'react';
import { db } from '@/components/data/firebase';
import Layout from '@/components/Layout';
import AuthContext from '@/components/stores/AuthContext';
import { useRouter } from 'next/router';
import { Heading, Container, Card, CardBody, Center, Alert, AlertIcon, Tag, Spinner, Button, Flex, List, ListItem, ListIcon } from '@chakra-ui/react';
import { ChevronDownIcon, ArrowForwardIcon, CheckCircleIcon } from '@chakra-ui/icons';

const BookFlat = () => {

    const router = useRouter();
    const { id } = router.query;

    const { additionalInfo } = useContext(AuthContext);

    const [flatInfo, setFlatInfo] = useState();
    const [error, setError] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const [steps, setSteps] = useState('');

    const getAppointFlatInfo = async () => {
        const response = await getDoc(doc(db, "appointed", id));
        if (response.exists()) {
            if (response.data().isVerified === true) {
                setFlatInfo(response.data());
                console.log(response.data());
            } else {
                console.log('I ran');
                setError('Approval is not verified');
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
        setErrorMessage('');
        setLoading(true);
        const block = flatInfo.blockSelected;
        const floor = flatInfo.floorSelected;
        const room = flatInfo.roomSelected;
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
                    console.log(response);
                } catch (error) {
                    setError(error.message);
                    console.log(error);
                }

                console.log('DONE');
            }
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
                {!initialLoading && flatInfo && <Container>
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
                    <Flex justifyContent='center'>
                        <Button type="submit" isDisabled={!!error} isLoading={loading} rightIcon={<ArrowForwardIcon />} colorScheme='blue' variant='outline'>
                            Start the Agreement Process
                        </Button>
                    </Flex>
                </Container>
            </div>}
        </Layout>
    );
}

export default BookFlat;