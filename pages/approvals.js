import Layout from "@/components/Layout";
import { db } from "@/components/data/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Container, FormControl, FormLabel, Select, FormHelperText, Heading, InputGroup, Input, InputRightElement, Text, Tag, Button, Spinner, ButtonGroup, Flex, Alert, AlertIcon, Center, AlertTitle, AlertDescription, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer, Icon, HStack, } from "@chakra-ui/react";
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { useRouter } from "next/router";
import withAuth from "@/components/routes/PrivateRoute";

const Approvals = () => {

    // Router
    const router = useRouter();

    // Initial Data
    const [appointed, setAppointed] = useState([]);
    const [allAppointed, setAllAppointed] = useState([]);

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    // Information
    const [search, setSearch] = useState('');

    const getInformation = async () => {
        const q = query(collection(db, "appointed"), where("isVerified", "==", false), where("isRejected", "==", false), where("isVerified", "==", false));
        const response = await getDocs(q);
        let tempAppointed = [];
        response.forEach(doc => {
            tempAppointed = [...tempAppointed, {
                id: doc.id,
                ...doc.data()
            }]
        })
        setAppointed(tempAppointed);
        setAllAppointed(tempAppointed);
        setInitialLoading(false);
    }

    useEffect(() => {
        getInformation();
    }, [])

    const searchHandler = (e) => {
        setSearch(e.target.value);
        const requirements = allAppointed.filter(appointment => appointment.id.includes(e.target.value));
        setAppointed(requirements);
    }

    const detailHandler = (id) => {
        setLoading(true);
        router.push(`/approvals/${id}`);
        setLoading(false);
    }

    return (
        <Layout>
            {!initialLoading && <Center><Flex direction="column">
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
                                {appointed.length === 0 && <Text mb="10"><Alert>No approvals available</Alert></Text>}
                                <Text mb="10">Appovals</Text>

                            </TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Name</Th>
                                    <Th>Mobile No</Th>
                                    <Th>Email</Th>
                                    <Th>Created At</Th>
                                    <Th>Details</Th>
                                </Tr>
                            </Thead>
                            <Tbody>

                                {appointed.length > 0 && appointed.map(appoint => (
                                    <Tr key={appoint?.id}>
                                        <Td>{appoint?.id}</Td>
                                        <Td>{appoint?.name}</Td>
                                        <Td>{appoint?.phoneNo}</Td>
                                        <Td>{appoint?.email}</Td>
                                        <Td>{new Date(appoint.createdAt).toLocaleDateString()}</Td>
                                        <Td cursor='pointer' onClick={() => detailHandler(appoint.id)}><Button isLoading={loading}><InfoOutlineIcon color="green.500" /></Button></Td>

                                    </Tr>))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </div>
            </Flex></Center>}
        </Layout>
    )
}


export default withAuth(Approvals);