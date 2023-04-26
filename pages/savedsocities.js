import Layout from "@/components/Layout";
import { db } from "@/components/data/firebase";
import AuthContext from "@/components/stores/AuthContext";
import { Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Text, SimpleGrid, Spinner, Center, Alert, AlertIcon } from '@chakra-ui/react'
import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import withAuth from "@/components/routes/PrivateRoute";


const SavedSocities = () => {

    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [socities, setSocities] = useState();

    const getInformation = async () => {
        try {
            const response = await getDoc(doc(db, "users", user.uid));
            if (response.exists()) {
                setSocities(response.data().savedSociety);
            }
        } catch (error) {
            console.log(error);
        }

        setLoading(false);
    }

    useEffect(() => {
        if (user)
            getInformation();
    }, [user])

    return (
        <Layout>
            <div className="">
                <Heading as='h3' size='lg' className="pb-8">
                    List of saved societies
                </Heading>
                {!loading && socities.length === 0 && <Alert status='warning' mb={10}>
                    <AlertIcon />
                    Seems there are no saved societies
                </Alert>}
                <SimpleGrid columns={1} spacingX='40px' spacingY='20px'>
                    {loading && <Center><Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                    /></Center>}
                    {!loading && socities.length > 0 && socities.map(society => (

                        <Card
                            direction={{ base: 'column', sm: 'row' }}
                            overflow='hidden'
                            variant='outline'
                            key={society?.name}
                        >
                            <Image
                                // objectFit='cover'
                                boxSize='200px'
                                src={society?.image}
                                alt='Caffe Latte'
                            />

                            <Stack>
                                <CardBody>
                                    <Heading size='md'>{society?.name}</Heading>

                                    <Text py='2'>
                                        Located in city {society?.area.toLocaleUpperCase()} and area is {society?.city.toLocaleUpperCase()}
                                    </Text>
                                </CardBody>

                                <CardFooter>
                                    <button className="px-3 py-3 rounded-md text-white bg-[#425b8b]">
                                        <Link href={`/society/${society.societyId}`}>More Details</Link>
                                    </button>
                                </CardFooter>
                            </Stack>
                        </Card>

                    ))}
                </SimpleGrid>
            </div>
        </Layout>
    )
}

export default withAuth(SavedSocities);