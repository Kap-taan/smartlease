import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Agreement from '../../ethereum/build/Agreement.json';
import web3 from '@/ethereum/web3';
import { doc, endAt, getDoc } from "firebase/firestore";
import { db } from "@/components/data/firebase";
import Layout from "@/components/Layout";
import { Card, CardBody, Heading, Image, Spinner, Alert, AlertIcon, Center, Tag, HStack, SimpleGrid, Container, Stack, Divider, CardFooter, ButtonGroup, Button, Highlight } from '@chakra-ui/react'
import { CalendarIcon, UnlockIcon, MinusIcon, WarningIcon } from '@chakra-ui/icons'
import withAuth from "@/components/routes/PrivateRoute";

const RentedFlat = () => {

    const router = useRouter();
    const { id } = router.query;

    // Variables from the contract
    const [flatInfo, setFlatInfo] = useState();
    const [startedDate, setStartedDate] = useState();
    const [endDate, setEndDate] = useState();
    const [isFinished, setIsFinished] = useState();
    const [uptoRentSubmitted, setUptoRentSubmitted] = useState();

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [stage, setStage] = useState('');
    const [loading, setLoading] = useState(false);

    // Decision states
    const [isRentDue, setIsRentDue] = useState(false);
    const [nothing, setNothing] = useState(false);

    // Error states
    const [error, setError] = useState('');


    const getFlatInformation = async () => {
        try {
            const response = await getDoc(doc(db, "appointed", id));
            if (response.exists()) {
                setFlatInfo({
                    id,
                    ...response.data()
                })
                getInformation(response.data().contractAddress);
            }
        } catch (error) {
            console.log(error);
        }

    }

    const payRentHandler = async () => {
        setLoading(true);
        setStage('Process of paying rent is in process');
        const instance = new web3.eth.Contract(
            JSON.parse(Agreement.interface),
            flatInfo.contractAddress
        );
        try {
            const now = new Date(uptoRentSubmitted * 1000);

            // Add one month to the current date
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
            const argument = (nextMonth.getTime() / 1000);
            // Output the date and time of next month
            const accounts = await web3.eth.getAccounts();
            await instance.methods.payRent(argument).send({
                from: accounts[0],
                value: flatInfo.rent.toString()
            })
            console.log('Money is paid successfully');
            getInformation(flatInfo.contractAddress);
            return;
        } catch (error) {
            console.log(error);
            setError(error.message);
        }
        setLoading(false);
    }
    const getInformation = async (address) => {
        const instance = new web3.eth.Contract(
            JSON.parse(Agreement.interface),
            address
        );
        let tempstartedDate = await instance.methods.startedDate().call();
        tempstartedDate = parseInt(tempstartedDate);
        setStartedDate(tempstartedDate);
        let tempendDate = await instance.methods.endDate().call();
        tempendDate = parseInt(tempendDate);
        setEndDate(tempendDate);
        let tempisFinished = await instance.methods.isFinished().call();
        setIsFinished(tempisFinished);
        let tempuptoRentSubmitted = await instance.methods.getStatus().call();
        tempuptoRentSubmitted = parseInt(tempuptoRentSubmitted);
        setUptoRentSubmitted(tempuptoRentSubmitted);

        // All work to be done by temp variables
        // Checking if the agreement is already finished or not
        if (tempisFinished === true) {
            setInitialLoading(false);
            setIsRentDue(false);
            setLoading(false);
            return;
        }

        // Check whether rent is due or not
        if ((tempuptoRentSubmitted * 1000) < new Date().getTime()) {
            // Rent is overdue
            setInitialLoading(false);
            setIsRentDue(true);
            setLoading(false);
            return;
        }

        // Check whether agreement is finished or not
        if (endDate <= new Date().getTime()) {
            //  Agreement is finished
            try {
                await instance.methods.finishAgreement().send({
                    from: accounts[0]
                })
                console.log('Successfully given the security money');
                setIsFinished(true);
                setIsRentDue(false);
                setNothing(false);
                setInitialLoading(false);
                return;
            } catch (error) {
                setError(error.message);
                console.log(error);
            }

        }

        setInitialLoading(false);
        setIsRentDue(false);
        setLoading(false);
        setNothing(true);

    }

    useEffect(() => {
        getFlatInformation();
    }, [])

    return (
        <Layout>
            {initialLoading && <Center><Spinner size='xl' color='blue.500' /></Center>}
            {!initialLoading && error && <Container mb="7">
                <Alert status='error'>
                    <AlertIcon />
                    {error}
                </Alert>
            </Container>}
            {!initialLoading && <div className="mb-14">
                <Card
                    direction={{ base: 'column', sm: 'row' }}
                    overflow='hidden'
                    variant='outline'
                >
                    <Image
                        objectFit='cover'
                        width="50%"
                        src={flatInfo?.image}
                        alt='Caffe Latte'
                    />
                    <Center>
                        <CardBody w="100%">
                            <div className="mb-8"><Heading>{flatInfo?.societyName}</Heading></div>
                            <HStack spacing={4} mb={2}>
                                <Tag>Type : {flatInfo?.bhk}</Tag>
                                <Tag>Block No. : {flatInfo?.blockNo}</Tag>
                                <Tag>Floor : {flatInfo?.floorSelected}</Tag>
                                <Tag>Flat No. : {flatInfo?.roomSelected}</Tag>
                            </HStack>
                            <HStack spacing={4} mb={3}>
                                <Tag>Agreement Limit : {flatInfo?.agreementLimit} years</Tag>
                                <Tag>Rent : {flatInfo?.rent} wei</Tag>
                                <Tag>Security : {flatInfo?.securityAmount} wei</Tag>
                            </HStack>
                            <HStack>
                                {endDate && <Tag>End Date : {new Date(endDate).toDateString()}</Tag>}
                            </HStack>
                            <div className="mt-8 flex">
                                <ButtonGroup spacing={10}>
                                    <Stack direction='row' spacing={10}>
                                        {isFinished && <Button leftIcon={<CalendarIcon />} _hover={{ backgroundColor: "red.600", color: "white" }} colorScheme='red' variant='outline'>
                                            Already terminated
                                        </Button>}
                                        {isRentDue && <Button isLoading={loading} loadingText={stage} onClick={payRentHandler} rightIcon={<WarningIcon />} _hover={{ backgroundColor: "red.300", color: "white" }} colorScheme='red' variant='outline'>
                                            Pay rent
                                        </Button>}
                                        {nothing && <Button rightIcon={<UnlockIcon />} _hover={{ backgroundColor: "green.600", color: "white" }} colorScheme='green' variant='outline'>
                                            No action required
                                        </Button>}
                                    </Stack>
                                </ButtonGroup>
                            </div>

                        </CardBody>
                    </Center>

                </Card>
            </div>}
        </Layout>
    );
}

export default withAuth(RentedFlat);