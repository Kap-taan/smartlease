import { useContext, useEffect, useState } from "react";
import SocietyContext from "../components/stores/SocietyContext";
import { db } from '../components/data/firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { runTransaction } from "firebase/firestore";
import AuthContext from '../components/stores/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import withAuth from "@/components/routes/PrivateRoute";
import { Container, FormControl, FormLabel, Select, FormHelperText, Heading, Card, CardBody, Text, Tag, Button, Spinner, ButtonGroup, Flex, Alert, AlertIcon, Center, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { ChevronDownIcon, ArrowForwardIcon, SmallCloseIcon } from '@chakra-ui/icons';

const BookSlot = () => {

    const { selectedSociety, removeSelectedSociety } = useContext(SocietyContext);

    const [dates, setDates] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [generalInfo, setGeneralInfo] = useState({});

    const [stage, setStage] = useState('first');
    const [complete, setComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');

    const { user, additionalInfo } = useContext(AuthContext);

    const [selectedDate, setSelectedDate] = useState('');

    const router = useRouter();

    const getDateInformation = () => {
        let currentDate = new Date();
        let tempDates = [];
        for (let i = 1; i <= 3; i++) {
            let nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            tempDates.push(nextDate);
        }
        setDates(tempDates);
        setInitialLoading(false);
        setStage('first');
    }

    const getGeneralInformation = async () => {
        setLoading(true);
        setError('')
        try {
            const response = await getDoc(doc(db, "generalInfo", "information"));
            if (response.exists()) {
                setGeneralInfo(response.data());
                setLoading(false);
            }
        } catch (error) {
            setError(error);
            setLoading(false);
            setStage('error');
            console.log(error);
        }
    }

    const getDateDocument = (daate) => {
        let date = new Date(daate);

        // Extract the day, month, and year
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = date.getFullYear().toString();

        // Concatenate the values into the desired format
        let formattedDate = day + month + year;

        return formattedDate;
    }

    const getAvailableSlots = async (date) => {
        // Check whether the document is available or not
        setError('');
        const response = await getDoc(doc(db, "slots", getDateDocument(date)))
        if (response.exists()) {
            // That date is present
            let tempTimeSlots = [];
            generalInfo.timingsofSlots.map(timeSlot => {
                if (response.data()[timeSlot] < generalInfo.limitOfSlots) {
                    // Add it to the available time slot
                    tempTimeSlots = [...tempTimeSlots, timeSlot];
                }
            })
            tempTimeSlots.sort((a, b) => {
                const [startA, endA] = a.split("-").map(Number);
                const [startB, endB] = b.split("-").map(Number);
                if (startA !== startB) {
                    return startA - startB;
                } else {
                    return endA - endB;
                }
            });
            setTimeSlots(tempTimeSlots);
            setLoading(false);
        } else {
            // Add the document with the name and time slots
            // Making the object
            let tempTimeSlots = {};
            // let availableTimeSlots = Object.keys(generalInfo.timingsofSlots)
            // console.log(availableTimeSlots)
            generalInfo.timingsofSlots.map(timeslot => {
                tempTimeSlots[timeslot] = 0;
            })
            try {
                await setDoc(doc(db, "slots", getDateDocument(date)), tempTimeSlots);
                let temp = generalInfo.timingsofSlots
                temp.sort((a, b) => {
                    const [startA, endA] = a.split("-").map(Number);
                    const [startB, endB] = b.split("-").map(Number);
                    if (startA !== startB) {
                        return startA - startB;
                    } else {
                        return endA - endB;
                    }
                });
                setTimeSlots(temp);
                console.log('New document added successfully');
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.log(error);
                setError(error);
                setStage('error');
                return;
            }
        }

        setStage('second');
    }

    const bookHandler = async (e) => {
        e.preventDefault();
        setError('')
        setLoading(true);
        const selectedSlot = e.target.slot.value;
        // Increment the number by one
        // Appointment Document
        const newData = {
            name: additionalInfo.name,
            area: additionalInfo.area,
            city: additionalInfo.city,
            email: additionalInfo.email,
            mobileNumber: additionalInfo.mobileNumber,
            uid: additionalInfo.uid,
            societyName: selectedSociety.name,
            buildings: selectedSociety.buildings,
            date: new Date(selectedDate),
            slot: selectedSlot,
            isVisited: false,
            isRejected: false,
            image: selectedSociety.image,
            createdAt: new Date().getTime(),
            societyId: selectedSociety.id
        }

        try {
            await runTransaction(db, async (transaction) => {
                const slotRef = doc(db, "slots", getDateDocument(selectedDate));
                const appointmentRef = doc(db, "appointments", uuidv4());
                const sfDoc = await transaction.get(slotRef);
                if (!sfDoc.exists()) {
                    throw "Document does not exist!";
                }
                let tempData = sfDoc.data()[selectedSlot] + 1;
                if (tempData <= generalInfo.limitOfSlots) {
                    transaction.update(slotRef, {
                        [selectedSlot]: tempData
                    });
                } else {
                    throw "Limit exceeds";
                }
                transaction.set(appointmentRef, newData);
            });
            console.log("Transaction successfully committed!");
            finishProcess();
            setStage('third');
            setLoading(false);
        } catch (e) {
            setLoading(false);
            setError('Transaction failed ', e);
            setStage('error');
            console.log("Transaction failed: ", e);
        }

    }

    const finishProcess = () => {
        setLoading(true);
        removeSelectedSociety();
        setComplete(true);
        setSelectedDate('');
        setLoading(false);
    }

    const cancelProcess = () => {
        setLoading(true);
        removeSelectedSociety();
        setLoading(false);
        router.push('/explore');
    }

    const dateHandler = (e) => {
        e.preventDefault();
        setLoading(true);
        const date = new Date(e.target.date.value);
        setSelectedDate(date);
        getAvailableSlots(e.target.date.value)
    }

    const goBackHandler = () => {
        router.push('/dashboard');
    }

    const backHandler = () => {
        setSelectedDate('');
        setStage('first');
    }

    useEffect(() => {
        setError('');
        if (!selectedSociety) {
            return;
        }
        getDateInformation();
        getGeneralInformation();
    }, [selectedSociety])

    return (
        <Layout>
            <div className="mb-10">
                <div className="mb-5">
                    <Heading as='h3' size='lg'>Slot Booking</Heading>
                </div>
                {!initialLoading && selectedSociety && <Container>
                    <Card>
                        <CardBody>
                            <Text>Selected society is <Tag>{selectedSociety?.name}</Tag> and location is {selectedSociety?.area?.toLocaleUpperCase()}, {selectedSociety?.city?.toLocaleUpperCase()}</Text>
                        </CardBody>
                    </Card>
                </Container>}
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
                    {!initialLoading && stage === 'first' && <form onSubmit={dateHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Date</FormLabel>
                            <Select name="date" icon={<ChevronDownIcon />}>
                                {dates && dates.map(date => (
                                    <option key={date.toDateString()} value={date}>{date.toDateString()}</option>
                                ))}
                            </Select>
                            <FormHelperText>Select the date when you want to visit the society</FormHelperText>
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
                    {stage === 'second' && <form onSubmit={bookHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Time slot</FormLabel>
                            {timeSlots.length > 0 && <Select name="slot" icon={<ChevronDownIcon />}>
                                {timeSlots && timeSlots.map(slot => (
                                    <option value={slot} key={slot}>{slot}</option>
                                ))}
                            </Select>}
                            <FormHelperText>Select the time slot in which you will be free</FormHelperText>
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
                    {stage === 'third' && <Alert
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
                            Slot is booked successfully
                        </AlertTitle>
                        <AlertDescription maxWidth='sm'>
                            Success! You have successfully booked a slot to visit our site. We can't wait to see you!
                        </AlertDescription>
                    </Alert>}
                    {stage === 'third' && <Center>
                        <Button colorScheme='blue' variant='outline' onClick={goBackHandler}>
                            Go back to Home Page
                        </Button>
                    </Center>}

                </Container>
            </div>}
        </Layout>
    )
}

export default withAuth(BookSlot);