import Layout from "@/components/Layout";
import { db } from "@/components/data/firebase";
import AuthContext from "@/components/stores/AuthContext";
import { Heading, SimpleGrid, Card, Image, Stack, CardBody, Text, HStack, CardFooter, Button, Tag, Badge, Alert, AlertIcon } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import withAuth from "@/components/routes/PrivateRoute";

const ApprovalStatus = () => {

    // Current User
    const { user } = useContext(AuthContext);

    // Essential Data
    const [approvals, setApprovals] = useState([]);

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const getApprovalInformation = async () => {
        try {
            const q = query(collection(db, "appointed"), where("clientId", "==", user.uid), where("isAppointed", "==", false), orderBy("createdAt", "desc"));
            const response = await getDocs(q);
            let tempApprovals = [];
            response.forEach(doc => {
                tempApprovals.push({
                    id: doc.id,
                    ...doc.data()
                })
            })
            console.log(tempApprovals);
            setApprovals(tempApprovals);
        } catch (error) {
            console.log(error);
        }
        setInitialLoading(false);
    }

    useEffect(() => {
        if (user)
            getApprovalInformation();
    }, [user])

    return (
        <Layout>
            <Heading as='h3' size='lg' className="pb-8">
                Approval status
            </Heading>
            {!initialLoading && approvals.length === 0 && <Alert status='warning' mb={10}>
                <AlertIcon />
                Seems your account has no approval to be continued
            </Alert>}
            <SimpleGrid columns={1} spacingX='40px' spacingY='20px'>
                {!loading && approvals.length > 0 && approvals.map(approval => (

                    <Card
                        direction={{ base: 'column', sm: 'row' }}
                        overflow='hidden'
                        variant='outline'
                        key={approval?.id}
                    >
                        <Image
                            // objectFit='cover'
                            boxSize='300px'
                            h="100%"
                            src={approval?.image}
                            alt='Caffe Latte'
                        />

                        <Stack>
                            <CardBody>
                                <Heading size='md' py="3">{approval?.societyName}</Heading>
                                <Text pb="3">
                                    Information is submitted at <Badge colorScheme='blue'>{new Date(approval.createdAt).toDateString()}</Badge>
                                </Text>
                                {/* <Text pb='3'>
                                    Time slot of booking is <Badge colorScheme="blue">{booking.slot}</Badge>
                                </Text> */}

                                <HStack spacing={4}>
                                    <Tag colorScheme="blue">{approval?.city?.toLocaleUpperCase()}</Tag>
                                    <Tag colorScheme="blue">{approval?.area?.toLocaleUpperCase()}</Tag>
                                </HStack>

                            </CardBody>

                            <CardFooter>
                                <Stack direction='row' spacing={4}>
                                    {approval?.isVerified && <Button colorScheme='blue' variant='outline'>
                                        <Link href={`/bookflat/${approval?.id}`}>Continue the process</Link>
                                    </Button>}
                                    {!approval?.isVerified && !approval?.isRejected && <Button isDisabled={true} colorScheme="green" variant='outline'>
                                        Approval is pending
                                    </Button>}
                                    {approval?.isRejected && <Button isDisabled={true} colorScheme="red" variant='outline'>
                                        Rejected
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

export default withAuth(ApprovalStatus);