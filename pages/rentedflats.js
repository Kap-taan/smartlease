import Layout from "@/components/Layout";
import { db } from "@/components/data/firebase";
import AuthContext from "@/components/stores/AuthContext";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Text, SimpleGrid, Spinner, Center, Alert, AlertIcon, Tag, HStack } from '@chakra-ui/react';
import Link from "next/link";
import withAuth from "@/components/routes/PrivateRoute";


const RentedFlat = () => {

    const { user } = useContext(AuthContext);

    const [flats, setFlats] = useState([]);

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const getInformation = async () => {
        try {
            const q = query(collection(db, "appointed"), where("clientId", "==", user.uid), where("isAppointed", "==", true), orderBy("createdAt", "desc"));
            const response = await getDocs(q);
            let tempFlats = [];
            response.forEach(doc => {
                tempFlats.push({
                    id: doc.id,
                    ...doc.data()
                })
            })
            console.log(tempFlats);
            setFlats(tempFlats);
        } catch (error) {
            console.log(error);
        }
        setInitialLoading(false);
    }

    useEffect(() => {
        getInformation();
    }, [])

    return (
        <Layout>
            <div className="">
                <Heading as='h3' size='lg' className="pb-8">
                    List of Rented Flats
                </Heading>
                {!initialLoading && flats.length === 0 && <Alert status='warning' mb={10}>
                    <AlertIcon />
                    No flats are rented till now
                </Alert>}
                <SimpleGrid columns={1} spacingX='40px' spacingY='20px'>
                    {initialLoading && <Center><Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                    /></Center>}
                    {!loading && flats.length > 0 && flats.map(flat => (

                        <Card
                            direction={{ base: 'column', sm: 'row' }}
                            overflow='hidden'
                            variant='outline'
                            key={flat.id}
                        >
                            <Image
                                // objectFit='cover'
                                boxSize='300px'
                                src={flat.image}
                                alt='Caffe Latte'
                                h="100%"
                            />

                            <Stack>
                                <CardBody>
                                    <Heading size='md'>{flat?.societyName}</Heading>

                                    <Text py='2'>
                                        Located in city {flat?.area.toLocaleUpperCase()} and area is {flat?.city.toLocaleUpperCase()}
                                    </Text>
                                    <HStack spacing={4} mb={3}>
                                        <Tag>Type : {flat?.bhk}</Tag>
                                        <Tag>Block No. : {flat?.blockNo}</Tag>
                                        <Tag>Floor : {flat?.floorSelected}</Tag>
                                        <Tag>Flat No. : {flat?.roomSelected}</Tag>
                                    </HStack>
                                    <HStack spacing={4} >
                                        <Tag>Agreement Limit : {flat?.agreementLimit} years</Tag>
                                        <Tag>Rent : {flat?.rent} wei</Tag>
                                        <Tag>Security : {flat?.securityAmount} wei</Tag>
                                    </HStack>
                                </CardBody>

                                <CardFooter>
                                    <Link href={`/rentedflat/${flat.id}`}>
                                        <Button colorScheme="blue" variant="outline">
                                            Details
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Stack>
                        </Card>

                    ))}
                </SimpleGrid>
            </div>
        </Layout >
    );
}

export default withAuth(RentedFlat);