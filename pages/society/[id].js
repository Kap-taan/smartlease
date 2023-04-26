import { arrayUnion, doc, getDoc, writeBatch, arrayRemove } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
import { useRouter } from "next/router";
import { db } from "../../components/data/firebase";
import Link from "next/link";
import SocietyContext from "../../components/stores/SocietyContext";
import AuthContext from '../../components/stores/AuthContext';
import Layout from "@/components/Layout";
import { Card, CardBody, Heading, Image, Spinner, CardHeader, Text, Center, Tag, HStack, SimpleGrid, Container, Stack, Divider, CardFooter, ButtonGroup, Button, Highlight } from '@chakra-ui/react'
import { CalendarIcon, AddIcon, MinusIcon } from '@chakra-ui/icons'
import withAuth from "@/components/routes/PrivateRoute";


const Society = () => {

    const router = useRouter();
    const { id } = router.query

    console.log(id);

    const { user } = useContext(AuthContext);

    const { selectedSociety, addSelectedSociety } = useContext(SocietyContext);

    const [society, setSociety] = useState({});
    const [loading, setLoading] = useState(false);

    const [isSaved, setIsSaved] = useState(false);

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [bookLoading, setBookLoading] = useState(false);


    const getSocietyInfo = async () => {
        setInitialLoading(true);
        try {
            const response = await getDoc(doc(db, "socities", id));
            if (response.exists()) {
                console.log(response.data().usersUid)
                setIsSaved(response.data().usersUid.includes(user.uid) ? true : false);
                setSociety({ id, ...response.data() });
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
        }

        setInitialLoading(false);
    }

    const bookHandler = () => {
        setBookLoading(true);
        addSelectedSociety(society);
        router.push('/bookslot');
        setBookLoading(false);
    }

    const saveIt = async () => {
        setSaveLoading(true);
        const savedSociety = {
            name: society.name,
            city: society.city,
            area: society.area,
            image: society.image,
            buildings: society.buildings,
            societyId: id
        }

        // Get a new write batch
        const batch = writeBatch(db);

        const userRef = doc(db, "users", user.uid);
        batch.update(userRef, { savedSociety: arrayUnion(savedSociety) });

        const societyRef = doc(db, "socities", id);
        batch.update(societyRef, { "usersUid": arrayUnion(user.uid) });

        // Commit the batch
        await batch.commit();

        setIsSaved(true);

        console.log('Save is successful');
        setSaveLoading(false);

    }

    const unsaveIt = async () => {
        setSaveLoading(true);

        const savedSociety = {
            name: society.name,
            city: society.city,
            area: society.area,
            image: society.image,
            buildings: society.buildings,
            societyId: id
        }

        const batch = writeBatch(db);
        const userRef = doc(db, "users", user.uid);
        batch.update(userRef, { savedSociety: arrayRemove(savedSociety) });

        const societyRef = doc(db, "socities", id);
        batch.update(societyRef, { "usersUid": arrayRemove(user.uid) });

        await batch.commit();
        setIsSaved(false);

        console.log('Unsave is successful');
        setSaveLoading(false);

    }

    useEffect(() => {
        getSocietyInfo();
    }, [])

    return (
        <Layout>
            {initialLoading && <Center><Spinner size='xl' color='blue.500' /></Center>}
            {!initialLoading && <div className="mb-14">
                <Card
                    direction={{ base: 'column', sm: 'row' }}
                    overflow='hidden'
                    variant='outline'
                >
                    <Image
                        objectFit='cover'
                        width="100%"
                        src={society?.image}
                        alt='Caffe Latte'
                    />
                    <Center>
                        <CardBody w="100%">
                            <div className="mb-8"><Heading>{society?.name}</Heading></div>
                            <Text>{society?.desc}</Text>
                            <div className="mt-8 flex">
                                <ButtonGroup spacing={10}>
                                    <Stack direction='row' spacing={10}>
                                        <Button onClick={bookHandler} leftIcon={<CalendarIcon />} _hover={{ backgroundColor: "blue.600", color: "white" }} colorScheme='blue' variant='outline'>
                                            Book
                                        </Button>
                                        {society && !isSaved && <Button onClick={saveIt} isLoading={saveLoading} rightIcon={<AddIcon />} _hover={{ backgroundColor: "blue.600", color: "white" }} colorScheme='blue' variant='outline'>
                                            Save
                                        </Button>}
                                        {society && isSaved && <Button onClick={unsaveIt} isLoading={saveLoading} rightIcon={<MinusIcon />} _hover={{ backgroundColor: "blue.600", color: "white" }} colorScheme='blue' variant='outline'>
                                            Unsave
                                        </Button>}
                                    </Stack>
                                </ButtonGroup>
                            </div>

                        </CardBody>
                    </Center>

                </Card>
            </div>}
            {!initialLoading && <div className="mb-12">
                <SimpleGrid spacing={2}>
                    <Card>
                        <CardHeader>
                            <Heading size='md'>Location of the society</Heading>
                        </CardHeader>
                        <CardBody>
                            <Text py='2'>

                                Located in city <Tag>{society?.city?.toLocaleUpperCase()}</Tag> and area is <Tag>{society?.area?.toLocaleUpperCase()}</Tag>
                            </Text>
                        </CardBody>
                    </Card>
                </SimpleGrid>
            </div>}
            {!initialLoading && <div className="mb-8">
                <Heading>List of blocks</Heading>
            </div>}
            {!initialLoading && <Container maxW='container.lg'>
                <SimpleGrid columns={2} spacing={8}>
                    {society.buildings && society.buildings.map(building => (
                        <Card key={building.blockName} maxW='sm'>
                            <CardBody>
                                <Image
                                    src={building?.thumbnail}
                                    h={'300px'}
                                    w={'350px'}
                                    alt='Green double couch with wooden legs'
                                    borderRadius='lg'
                                />
                                <Stack mt='6' spacing='3'>
                                    <Heading size='md'>{building?.blockName}</Heading>
                                    <Text>
                                        {building?.desc}
                                    </Text>
                                    <HStack spacing={4}>
                                        {building.typesOfFlats && Object.keys(building.typesOfFlats).map(type => (
                                            <Tag key={type} size="md" variant='solid' colorScheme='blue'>
                                                {type}
                                            </Tag>
                                        ))}

                                    </HStack>
                                </Stack>
                            </CardBody>
                            <Divider />
                            <CardFooter>
                                <ButtonGroup spacing='2'>
                                    <Button variant='ghost' colorScheme='blue'>
                                        More Details
                                    </Button>
                                </ButtonGroup>
                            </CardFooter>
                        </Card>
                    ))}

                </SimpleGrid>
            </Container>}
        </Layout >
    )
}

export default withAuth(Society);