import Layout from "@/components/Layout";
import { db } from "@/components/data/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, CardBody, Heading, Image, Spinner, Alert, AlertIcon, Center, Tag, HStack, SimpleGrid, Container, Stack, Divider, CardFooter, ButtonGroup, Button, Highlight, cookieStorageManager } from '@chakra-ui/react'
import { DownloadIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import withAuth from "@/components/routes/PrivateRoute";

const Approval = () => {

    const router = useRouter();
    const { id } = router.query;

    // Initial Information
    const [appointed, setAppointed] = useState();

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);

    const getInformation = async () => {
        const docRef = doc(db, "appointed", id);
        const response = await getDoc(docRef);
        if (response.exists()) {
            setAppointed(response.data());
        }
        console.log(response.data());
        setInitialLoading(false);
    }

    useEffect(() => {
        getInformation();
    }, [])

    const acceptHandler = async () => {
        setAcceptLoading(true);
        try {
            await updateDoc(doc(db, "appointed", id), {
                isVerified: true
            })
        } catch (error) {
            console.log(error);
        }
        setAcceptLoading(false);
        router.push('/approvals');
    }

    const rejectHandler = async () => {
        setRejectLoading(true);
        try {
            await updateDoc(doc(db, "appointed", id), {
                isRejected: true
            })
        } catch (error) {
            console.log(error);
        }
        setRejectLoading(false);
        router.push('/approvals');
    }

    return (
        <Layout>
            {!initialLoading && <div className="mb-14">
                <Card
                    direction={{ base: 'column', sm: 'row' }}
                    overflow='hidden'
                    variant='outline'
                >
                    <Image
                        objectFit='cover'
                        width="50%"
                        src={appointed?.image}
                        alt='Caffe Latte'
                    />
                    <Center>
                        <CardBody w="100%">
                            <div className="mb-8"><Heading>{appointed?.societyName}</Heading></div>
                            <HStack spacing={4} mb={2}>
                                <Tag>Type : {appointed?.bhk}</Tag>
                                <Tag>Block No. : {appointed?.blockNo}</Tag>
                                <Tag>Floor : {appointed?.floorSelected}</Tag>
                                <Tag>Flat No. : {appointed?.roomSelected}</Tag>
                            </HStack>
                            <HStack spacing={4} mb={3}>
                                <Tag>Agreement Limit : {appointed?.agreementLimit} years</Tag>
                                <Tag>Rent : {appointed?.rent} wei</Tag>
                                <Tag>Security : {appointed?.securityAmount} wei</Tag>
                            </HStack>
                            <HStack spacing={4} mb={3}>
                                <Tag>Name : {appointed?.name}</Tag>
                                <Tag>Email : {appointed?.email}</Tag>
                                <Tag>Phone No : {appointed?.phoneNo}</Tag>
                            </HStack>
                            <HStack>
                                <a href={appointed?.documents} target="blank"><Button>Document : <DownloadIcon /></Button></a>
                            </HStack>
                            <div className="mt-8 flex">
                                <ButtonGroup spacing={10}>
                                    <Stack direction='row' spacing={10}>
                                        <Button leftIcon={<CheckCircleIcon />} isLoading={acceptLoading} onClick={acceptHandler} _hover={{ backgroundColor: "green.600", color: "white" }} colorScheme='green' variant='outline'>
                                            Approve
                                        </Button>
                                        <Button isLoading={rejectLoading} onClick={rejectHandler} rightIcon={<WarningIcon />} _hover={{ backgroundColor: "red.300", color: "white" }} colorScheme='red' variant='outline'>
                                            Reject
                                        </Button>

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

export default withAuth(Approval);