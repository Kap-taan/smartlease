import { collection, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../components/stores/AuthContext";
import { db } from "../components/data/firebase";
import withAuth from "@/components/routes/PrivateRoute";
import Layout from "@/components/Layout";
import { Heading, SimpleGrid, Card, Stack, CardBody, CardFooter, Image, Text, Tag, HStack, Badge, Button, Center, Spinner, Alert, AlertIcon } from '@chakra-ui/react'
import Link from "next/link";

const ViewBooking = () => {

    const { user } = useContext(AuthContext);

    const [bookings, setBookings] = useState([]);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getBookingDetails = async () => {
        setLoading(true);
        const q = query(collection(db, "appointments"), where("uid", "==", user.uid), where("isRejected", "==", false), orderBy("date", "desc"));
        try {
            const response = await getDocs(q);
            let tempBookings = []
            response.forEach(doc => {
                tempBookings = [...tempBookings, {
                    id: doc.id,
                    ...doc.data()
                }]
            })
            console.log(tempBookings);
            setBookings(tempBookings);
        } catch (error) {
            setLoading(false);
            setError(error);
            console.log(error);
        }

        setLoading(false);
    }

    const rejectHandler = async (id) => {
        setRejectLoading(true);
        const docRef = doc(db, "appointments", id);
        try {
            await updateDoc(docRef, {
                isRejected: true
            })
            const updatedBookings = bookings.filter(booking => booking.id !== id);
            setBookings(updatedBookings);
        } catch (error) {
            console.log(error);
        }

        setRejectLoading(false);
    }

    useEffect(() => {
        if (user)
            getBookingDetails()
    }, [user])

    return (
        <Layout>
            <Heading as='h3' size='lg' className="pb-8">
                Visit status
            </Heading>
            {!loading && bookings.length === 0 && <Alert status='warning' mb={10}>
                <AlertIcon />
                No pending visits
            </Alert>}
            <SimpleGrid columns={1} spacingX='40px' spacingY='20px'>
                {!loading && bookings.length > 0 && bookings.map(booking => (

                    <Card
                        direction={{ base: 'column', sm: 'row' }}
                        overflow='hidden'
                        variant='outline'
                        key={booking?.createdAt}
                    >
                        <Image
                            // objectFit='cover'
                            boxSize='300px'
                            h="100%"
                            src={booking?.image}
                            alt='Caffe Latte'
                        />

                        <Stack>
                            <CardBody>
                                <Heading size='md' py="3">{booking?.societyName}</Heading>
                                <Text>
                                    Date of booking is <Badge colorScheme='blue'>{new Date(booking.date.seconds * 1000).toDateString()}</Badge>
                                </Text>
                                <Text pb='3'>
                                    Time slot of booking is <Badge colorScheme="blue">{booking.slot}</Badge>
                                </Text>

                                <HStack spacing={4}>
                                    <Tag colorScheme="blue">{booking?.city?.toLocaleUpperCase()}</Tag>
                                    <Tag colorScheme="blue">{booking?.area?.toLocaleUpperCase()}</Tag>
                                </HStack>

                            </CardBody>

                            <CardFooter>
                                <Stack direction='row' spacing={4}>
                                    {booking?.isVisited && <Button colorScheme='blue' variant='outline'>
                                        <Link href={`/appointflat/${booking.id}`}>Continue the process</Link>
                                    </Button>}
                                    {booking?.isVisited && <Button isLoading={rejectLoading} onClick={() => rejectHandler(booking.id)} colorScheme='red' variant='outline'>
                                        Reject
                                    </Button>}
                                    {!booking?.isVisited && <Button isDisabled={true} colorScheme="green" variant='outline'>
                                        Visit is pending
                                    </Button>}
                                </Stack>

                            </CardFooter>
                        </Stack>
                    </Card>

                ))}
            </SimpleGrid>
        </Layout>
    )
}

export default withAuth(ViewBooking);