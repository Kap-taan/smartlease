import Layout from "@/components/Layout";
import { db } from "@/components/data/firebase";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Container, FormControl, FormLabel, Select, FormHelperText, Heading, InputGroup, Input, InputRightElement, Text, Tag, Button, Spinner, ButtonGroup, Flex, Alert, AlertIcon, Center, AlertTitle, AlertDescription, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer, Icon, HStack, } from "@chakra-ui/react";
import { ChevronDownIcon, ArrowForwardIcon, SmallCloseIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useRouter } from "next/router";
import withAuth from "@/components/routes/PrivateRoute";
const VisitDetails = () => {

    // Error States
    const [error, setError] = useState("");
    // Initial Information
    const [stage, setStage] = useState('first');
    const [socities, setSocities] = useState();
    const [types, setTypes] = useState(['Archive', 'Today', 'Upcoming']);
    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [visitLoading, setVisitLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    // Information
    const [society, setSociety] = useState();
    const [appointments, setAppointments] = useState();
    const [type, setType] = useState();
    const [requiredAppointments, setRequiredAppointments] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [search, setSearch] = useState('');

    // Navigate system
    const router = useRouter();

    const getSocitiesInformation = async () => {
        try {
            const response = await getDocs(collection(db, "socities"));
            let tempSocities = [];
            response.forEach(doc => {
                tempSocities = [...tempSocities, {
                    id: doc.id,
                    ...doc.data()
                }]
            })
            setSocities(tempSocities);
        } catch (error) {
            console.log(error);
        }
        setInitialLoading(false);
    }

    const getAppointmentsInformation = async (selectedSociety) => {
        try {
            const q = query(collection(db, "appointments"), where("societyId", "==", selectedSociety), where("isRejected", "==", false), where("isVisited", "==", false));
            const response = await getDocs(q);
            let tempAppointments = [];
            response.forEach(doc => {
                tempAppointments = [...tempAppointments, {
                    id: doc.id,
                    ...doc.data()
                }]
            })
            setAppointments(tempAppointments);
            console.log(tempAppointments);
            setStage('second');
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }


    useEffect(() => {
        getSocitiesInformation();
    }, [])

    const submitHandler = (e) => {
        e.preventDefault();
        setLoading(true);
        const selectedSociety = e.target.society.value;
        setSociety(selectedSociety);
        getAppointmentsInformation(selectedSociety);
    }

    const timeHandler = async (e) => {
        e.preventDefault();
        const tempType = e.target.type.value;
        console.log(tempType);
        setType(tempType);
        let tempRequiredAppointments = [];
        if (tempType === 'Archive') {
            tempRequiredAppointments = appointments.filter(appointment => {
                const yourDate = new Date(appointment.date.seconds * 1000);

                // get the current date
                const currentDate = new Date();

                // calculate the difference in milliseconds between the two dates
                const diffInMs = currentDate.getTime() - yourDate.getTime();

                // calculate the difference in days
                const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

                // check if the difference is greater than or equal to 1
                if (diffInDays >= 1) {
                    return true;
                } else {
                    return false;
                }
            })
        } else if (tempType === 'Upcoming') {
            tempRequiredAppointments = appointments.filter(appointment => {
                // create a Date object for your date
                const yourDate = new Date(appointment.date.seconds * 1000);

                // get tomorrow's date
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0);
                tomorrow.setMinutes(0);
                tomorrow.setSeconds(0);
                tomorrow.setMilliseconds(0);
                console.log(yourDate);
                console.log(tomorrow);
                // check if yourDate is greater than or equal to tomorrow's date
                if (yourDate.getTime() >= tomorrow.getTime()) {
                    return true;
                } else {
                    return false;
                }
            })
        } else {
            tempRequiredAppointments = appointments.filter(appointment => {
                // create a Date object for your date
                const yourDate = new Date(appointment.date.seconds * 1000);

                // get the current date
                const currentDate = new Date();

                // check if the two dates have the same year, month, and day
                if (
                    yourDate.getFullYear() === currentDate.getFullYear() &&
                    yourDate.getMonth() === currentDate.getMonth() &&
                    yourDate.getDate() === currentDate.getDate()
                ) {
                    return true;
                } else {
                    return false;
                }
            })
            console.log(tempRequiredAppointments);
        }
        setRequiredAppointments(tempRequiredAppointments);
        setAllAppointments(tempRequiredAppointments);
        setLoading(false);
        setStage('forth');
    }

    const cancelProcess = () => {
        router.push('/dashboard');
    }

    const searchHandler = (e) => {
        setSearch(e.target.value);
        const requirements = allAppointments.filter(appointment => appointment.id.includes(e.target.value));
        setRequiredAppointments(requirements);
    }

    const visitHandler = async (id) => {
        setVisitLoading(true);
        const docRef = doc(db, "appointments", id);
        try {
            await updateDoc(docRef, {
                isVisited: true
            })
        } catch (error) {
            console.log(error);
        }
        const temp = allAppointments.filter(appointment => appointment.id !== id);
        setAllAppointments(temp);
        setRequiredAppointments(temp);
        setVisitLoading(false);
    }

    const rejectHandler = async (id) => {
        setRejectLoading(true);
        const docRef = doc(db, "appointments", id);
        try {
            await updateDoc(docRef, {
                isRejected: true
            })
        } catch (error) {
            console.log(error);
        }
        const temp = allAppointments.filter(appointment => appointment.id !== id);
        setAllAppointments(temp);
        setRequiredAppointments(temp);
        setRejectLoading(false);
    }


    return (
        <Layout>
            <div className="mb-10">
                <div className="mb-5">
                    <Heading as='h3' size='lg'>Vists Information</Heading>
                </div>
                {initialLoading && <Center>
                    <Spinner size='xl' />
                </Center>}
                {error && stage === 'error' && <Container>
                    <Alert status='error'>
                        <AlertIcon />
                        {error}
                    </Alert>
                </Container>}
            </div>
            {<div>
                <Container>
                    {!initialLoading && stage === 'first' && <form onSubmit={submitHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Select the society</FormLabel>
                            <Select name="society" icon={<ChevronDownIcon />}>
                                {socities.map(society => (
                                    <option key={society.id} value={society.id}>{society.name}</option>
                                ))}
                            </Select>
                            <FormHelperText>Select the society name where you work</FormHelperText>
                        </FormControl>
                        <FormControl >
                            <Flex justifyContent='right'>
                                <ButtonGroup gap='2'>
                                    <Button type="submit" isDisabled={!!error} isLoading={loading} rightIcon={<ArrowForwardIcon />} colorScheme='blue' variant='outline'>
                                        Next
                                    </Button>
                                    <Button onClick={cancelProcess} rightIcon={<SmallCloseIcon />} colorScheme='red' variant='outline'>
                                        Cancel
                                    </Button>
                                </ButtonGroup>
                            </Flex>
                        </FormControl>
                    </form>}
                    {!initialLoading && stage === 'second' && <form onSubmit={timeHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Select the timeline</FormLabel>
                            <Select name="type" icon={<ChevronDownIcon />}>
                                {types.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                            <FormHelperText>Select the time phase of the appointments</FormHelperText>
                        </FormControl>
                        <FormControl >
                            <Flex justifyContent='right'>
                                <ButtonGroup gap='2'>
                                    <Button type="submit" isDisabled={!!error} isLoading={loading} rightIcon={<ArrowForwardIcon />} colorScheme='blue' variant='outline'>
                                        Next
                                    </Button>
                                    <Button onClick={cancelProcess} rightIcon={<SmallCloseIcon />} colorScheme='red' variant='outline'>
                                        Cancel
                                    </Button>
                                </ButtonGroup>
                            </Flex>
                        </FormControl>
                    </form>}
                    {!initialLoading && stage === 'third' && <form onSubmit={timeHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Select the timeline</FormLabel>
                            <Select name="type" icon={<ChevronDownIcon />}>
                                {types.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                            <FormHelperText>Select the time phase of the appointments</FormHelperText>
                        </FormControl>
                        <FormControl >
                            <Flex justifyContent='right'>
                                <ButtonGroup gap='2'>
                                    <Button type="submit" isDisabled={!!error} isLoading={loading} rightIcon={<ArrowForwardIcon />} colorScheme='blue' variant='outline'>
                                        Next
                                    </Button>
                                    <Button onClick={cancelProcess} rightIcon={<SmallCloseIcon />} colorScheme='red' variant='outline'>
                                        Cancel
                                    </Button>
                                </ButtonGroup>
                            </Flex>
                        </FormControl>
                    </form>}
                    {!initialLoading && stage === 'forth' && <Center><Flex direction="column">
                        <div className="mb-8">
                            <InputGroup size='md'>
                                <Input
                                    placeholder='Search the appointment'
                                    onChange={searchHandler}
                                    value={search}
                                />
                            </InputGroup>
                        </div>
                        <div>
                            <TableContainer>
                                <Table variant='simple'>
                                    <TableCaption>
                                        {requiredAppointments.length === 0 && <Text mb="10"><Alert>No appointments available</Alert></Text>}
                                        <Text mb="10">{type} appointments</Text>

                                    </TableCaption>
                                    <Thead>
                                        <Tr>
                                            <Th>ID</Th>
                                            <Th>Name</Th>
                                            <Th>Mobile No</Th>
                                            <Th>Slot</Th>
                                            <Th>Email</Th>
                                            <Th>Created At</Th>
                                            <Th>Visited</Th>
                                            <Th>Rejected</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>

                                        {requiredAppointments.length > 0 && requiredAppointments.map(requirement => (
                                            <Tr key={requirement?.id}>
                                                <Td>{requirement?.id}</Td>
                                                <Td>{requirement?.name}</Td>
                                                <Td>{requirement?.mobileNumber}</Td>
                                                <Td>{requirement?.slot}</Td>
                                                <Td>{requirement?.email}</Td>
                                                <Td>{new Date(requirement.createdAt).toLocaleDateString()}</Td>
                                                <Td cursor='pointer' onClick={() => visitHandler(requirement.id)}><Button isLoading={visitLoading}><CheckIcon color="green.500" /></Button></Td>
                                                <Td cursor='pointer' onClick={() => rejectHandler(requirement.id)}><Button isLoading={rejectLoading}><CloseIcon color="red.500" /></Button></Td>
                                            </Tr>))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </div>
                    </Flex></Center>}
                </Container>
            </div>}
        </Layout >
    );
}

export default withAuth(VisitDetails);