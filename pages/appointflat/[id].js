import Layout from "@/components/Layout";
import { db, storage } from "@/components/data/firebase";
import AuthContext from "@/components/stores/AuthContext";
import { doc, getDoc, addDoc, collection, writeBatch, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Container, FormControl, FormLabel, Select, FormHelperText, Heading, Card, CardBody, Text, Tag, Button, Spinner, ButtonGroup, Flex, Alert, AlertIcon, Center, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { ChevronDownIcon, ArrowForwardIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { connectStorageEmulator, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import withAuth from "@/components/routes/PrivateRoute";

const AppointFlat = () => {

    const router = useRouter();

    const { id } = router.query;

    // User Information
    const { user } = useContext(AuthContext);

    // All options
    const [appointmentData, setAppointmentData] = useState();
    const [blocks, setBlocks] = useState();
    const [bhks, setBhks] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);

    // Selected options
    const [bhk, setBhk] = useState(null);
    const [block, setBlock] = useState();
    const [floor, setFloor] = useState();
    const [room, setRoom] = useState();

    // Error state
    const [stage, setStage] = useState('first');
    const [error, setError] = useState('');

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const blockHandler = (e) => {
        e.preventDefault();
        setLoading(true);
        const tempBlock = blocks.filter(block => block.id === e.target.block.value)[0];
        setBlock(tempBlock);
        console.log(e.target.block.value);
        getBHKInformation(e.target.block.value);
    }

    const bhkHandler = (e) => {
        e.preventDefault();
        setLoading(true);
        setBhk(e.target.bhk.value);
        getAvailableFloors(e.target.bhk.value);
    }

    const floorHandler = (e) => {
        e.preventDefault();
        setLoading(true);
        setFloor(e.target.floor.value);
        getAvailableRooms(e.target.floor.value);
    }

    const roomHandler = (e) => {
        e.preventDefault();
        setLoading(true);
        setRoom(e.target.room.value);
        console.log('Room is updated');
        setLoading(false);
        setStage('fifth');
    }

    const uploadHandler = async (e) => {
        // TODO: Upload Documents Code
        e.preventDefault();
        setLoading(true);
        const imageUpload = e.target.document.files[0];
        let url = ""
        if (imageUpload !== null) {
            // Making the Image ref
            const imageRef = ref(storage, `documents/${imageUpload.name + uuidv4()}`)
            const response = await uploadBytes(imageRef, imageUpload)
            url = await getDownloadURL(response.ref)
            console.log('Uploaded');
        } else {
            setLoading(false);
            return;
        }

        const data = {
            clientId: user.uid,
            societySelected: appointmentData.societyId,
            blockSelected: block.id,
            floorSelected: parseInt(floor),
            roomSelected: parseInt(room),
            isVerified: false,
            documents: url,
            isAppointed: false,
            contractAddress: "",
            agreementLimit: block.agreementLimit,
            city: block.city,
            area: block.area,
            rent: block.rent[bhk],
            securityAmount: block.securityAmount,
            appointmentId: id,
            societyName: appointmentData.societyName,
            image: appointmentData.image,
            isRejected: false,
            createdAt: new Date().getTime(),
            blockNo: block.blockNo,
            bhk: bhk,
            name: appointmentData.name,
            email: appointmentData.email,
            phoneNo: appointmentData.mobileNumber
        };

        console.log(data);

        const batch = writeBatch(db);

        const id1 = uuidv4();
        const docRef1 = doc(db, "appointed", id1);
        batch.set(docRef1, data);

        const docRef2 = doc(db, "users", user.uid);
        batch.update(docRef2, {
            appointed: arrayUnion(id1)
        });

        const docRef3 = doc(db, "appointments", id);
        batch.update(docRef3, {
            isRejected: true
        })

        await batch.commit();

        console.log('Successful');

        setLoading(false);
        setStage('sixth');


        // Add the data to the database
        // try {
        //     await addDoc(collection(db, "appointed"), data);
        //     console.log('Document created successfully');
        // } catch (error) {
        //     console.log(error);
        // }

    }


    const getBlocksInformation = async (societyId) => {
        const response = await getDoc(doc(db, "socities", societyId));
        if (response.exists()) {
            setBlocks(response.data().buildings);
        }
        setInitialLoading(false);
    }

    const getBHKInformation = async (tempBlock) => {
        try {
            const response = await getDoc(doc(db, "buildings", tempBlock));
            if (response.exists()) {
                setBlock({ id: tempBlock, ...response.data() });
                setBhks(Object.keys(response.data().typesOfFlats).sort());
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
        setStage('second');

    }

    const getAvailableFloors = async (tempBhk) => {
        const minimumValue = block.totalRooms[tempBhk];
        let availableFloors = [];
        Object.entries(block.typesOfFlats[tempBhk]).forEach(([key, value]) => {
            if (value < minimumValue) {
                availableFloors.push(key);
            }
        });
        setFloors(availableFloors);
        setLoading(false);
        setStage('third');
    }

    const getAvailableRooms = async (tempFloor) => {
        const usedRooms = block.rooms[tempFloor].occupiedRooms;
        console.log(usedRooms);
        const tempRooms = block.totalRooms[bhk];
        console.log(tempRooms);
        const tempAvailableRooms = [];
        for (let i = 1; i <= tempRooms; i++) {
            if (usedRooms.indexOf(i) === -1) {
                // Available
                tempAvailableRooms.push(i);
            }
        }

        setRooms(tempAvailableRooms);
        setLoading(false);
        setStage('forth');
    }

    const getSocietyInformation = async () => {
        const docRef = doc(db, "appointments", id);
        const response = await getDoc(docRef);
        if (response.exists()) {
            setAppointmentData({
                id,
                ...response.data()
            })
            getBlocksInformation(response.data().societyId);
        }
    }

    const cancelProcess = () => {
        router.push('/dashboard');
    }

    useEffect(() => {
        getSocietyInformation();
    }, [])

    return (
        <Layout>
            <div className="mb-10">
                <div className="mb-5">
                    <Heading as='h3' size='lg'>Choose your flat</Heading>
                </div>
                {!initialLoading && appointmentData && <Container>
                    <Card>
                        <CardBody>
                            <Text>Selected society is <Tag>{appointmentData?.societyName}</Tag> and location is {appointmentData?.area?.toLocaleUpperCase()}, {appointmentData?.city?.toLocaleUpperCase()}</Text>
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
                    {!initialLoading && stage === 'first' && <form onSubmit={blockHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Block</FormLabel>
                            <Select name="block" icon={<ChevronDownIcon />}>
                                {blocks && blocks.map(block => (
                                    <option key={block.blockId} value={block.blockId}>{block.blockName}</option>
                                ))}
                            </Select>
                            <FormHelperText>Select the block of the society</FormHelperText>
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
                    {stage === 'second' && <form onSubmit={bhkHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Type of flat</FormLabel>
                            {bhks.length > 0 && <Select name="bhk" icon={<ChevronDownIcon />}>
                                {bhks && bhks.map(bhk => (
                                    <option key={bhk}>{bhk}</option>
                                ))}
                            </Select>}
                            <FormHelperText>Select the type of flat you prefer</FormHelperText>
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
                    {stage === 'third' && <form onSubmit={floorHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Select the floor</FormLabel>
                            {floors.length > 0 && <Select name="floor" icon={<ChevronDownIcon />}>
                                {floors && floors.map(floor => (
                                    <option key={floor}>{floor}</option>
                                ))}
                            </Select>}
                            <FormHelperText>Select the floor of the flat you prefer</FormHelperText>
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
                    {stage === 'forth' && <form onSubmit={roomHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Flat No.</FormLabel>
                            {rooms.length > 0 && <Select name="room" icon={<ChevronDownIcon />}>
                                {rooms && rooms.map(room => (
                                    <option key={room}>{room}</option>
                                ))}
                            </Select>}
                            <FormHelperText>Select the flat no. you prefer</FormHelperText>
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
                    {stage === 'fifth' && <form onSubmit={uploadHandler}>
                        <FormControl mb={9}>
                            <FormLabel>Upload documents</FormLabel>
                            <input name="document" type="file" className="appearance-none mb-8 pl-5 py-3 rounded-lg font-bold border border-navText" />
                            <FormHelperText>Upload the Aadhar Card</FormHelperText>
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
                    {stage === 'sixth' && <Alert
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
                            Information is collected successfully
                        </AlertTitle>
                        <AlertDescription maxWidth='sm'>
                            Thank you for submitting your information! Your application is currently under review. Please check the portal regularly for updates.
                        </AlertDescription>
                    </Alert>}
                    {stage === 'sixth' && <Center>
                        <Button colorScheme='blue' variant='outline' onClick={cancelProcess}>
                            Go back to Home Page
                        </Button>
                    </Center>}
                </Container>
            </div>}
        </Layout>
    );
}

export default withAuth(AppointFlat);