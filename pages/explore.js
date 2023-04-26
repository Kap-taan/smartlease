import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { db } from "../components/data/firebase";
import AuthContext from '../components/stores/AuthContext';
import { ClipLoader } from "react-spinners";
import Link from "next/link";
import Layout from "@/components/Layout";
import withAuth from "@/components/routes/PrivateRoute";
import { Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Text, SimpleGrid, Spinner, Center } from '@chakra-ui/react'

const Explore = () => {

    const { user, additionalInfo } = useContext(AuthContext);

    const [socities, setSocities] = useState([]);
    const [loading, setLoading] = useState(false);

    const getInfo = async () => {
        setLoading(true);
        const docQuery = query(collection(db, "socities"), where("city", "==", additionalInfo.city), where("area", "==", additionalInfo.area));
        try {
            const response = await getDocs(docQuery);
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
            setLoading(false);
            return;
        }

        setLoading(false);
    }

    useEffect(() => {
        if (additionalInfo) {
            getInfo();
        }
    }, [additionalInfo])

    return (
        <Layout>
            <div className="">
                <Heading as='h3' size='lg' className="pb-8">
                    Societies
                </Heading>
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
                            key={society.name}
                        >
                            <Image
                                // objectFit='cover'
                                boxSize='200px'
                                src={society.image}
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
                                        <Link href={`/society/${society.id}`}>More Details</Link>
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

export default withAuth(Explore);