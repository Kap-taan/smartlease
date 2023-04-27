import { useContext, useEffect } from "react";
import AuthContext from "./stores/AuthContext";
import { MoonLoader } from "react-spinners";
import Link from "next/link";
import { useRouter } from "next/router";
import { Card, CardHeader, CardBody, CardFooter, SimpleGrid, Heading, Button, Text, Image } from '@chakra-ui/react'
import { Container } from '@chakra-ui/react'

const Builder = () => {

    const { user } = useContext(AuthContext);
    const router = useRouter();


    return (
        <div>
            {/* {!additionalInfo && <div className="flex justify-center items-center mt-8"><MoonLoader color="#425b8b" /></div>} */}
            {/* {additionalInfo && <div className="flex flex-col items-center justify-center"> */}
            {/* {additionalInfo.city && <p className="mb-12">Hi <span className="text-lg font-bold text-[#425b8b]"> {additionalInfo.name} </span>, Your current city is <span className="text-lg font-bold text-[#425b8b]">{additionalInfo.city.toLocaleUpperCase()} ({additionalInfo.area.toLocaleUpperCase()})</span></p>} */}
            {/* <div>
                    <Link href="/changecity" className="border border-slate-600 px-7 py-3 mb-6 rounded-xl bg-[#425b8b] text-white mt-2 mr-8">Change city</Link>
                    <Link href="/explore" className="border border-slate-600 px-7 py-3 mb-6 rounded-xl bg-[#425b8b] text-white mt-2">Explore flats</Link>
                </div> */}
            {/* </div>} */}
            <Container maxW='container.lg'>
                <SimpleGrid columns={3} spacing={8}>
                    <Card>
                        <CardHeader>
                            <Image boxSize='50px' src='/icons/visit.png' alt='Dan Abramov' />
                        </CardHeader>
                        <CardBody>
                            <Heading size='md'>Visit Details</Heading>
                        </CardBody>
                        <CardFooter>
                            <Button><Link href="/explore">View here</Link></Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Image boxSize='50px' src='/icons/approval.png' alt='Dan Abramov' />
                        </CardHeader>
                        <CardBody>
                            <Heading size='md'>Approvals</Heading>
                        </CardBody>
                        <CardFooter>
                            <Button><Link href="/changecity">View here</Link></Button>
                        </CardFooter>
                    </Card>
                    {/* <Card>
                        <CardHeader>
                            <Image boxSize='50px' src='/icons/visit.png' alt='Dan Abramov' />
                        </CardHeader>
                        <CardBody>
                            <Heading size='md'>Visit Status</Heading>
                        </CardBody>
                        <CardFooter>
                            <Button><Link href="/viewbooking">View here</Link></Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Image boxSize='50px' src='/icons/approval.png' alt='Dan Abramov' />
                        </CardHeader>
                        <CardBody>
                            <Heading size='md'>Approval Status</Heading>
                        </CardBody>
                        <CardFooter>
                            <Button><Link href="/approvalstatus">View here</Link></Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Image boxSize='50px' src='/icons/rent.png' alt='Dan Abramov' />
                        </CardHeader>
                        <CardBody>
                            <Heading size='md'>Rented Flats</Heading>
                        </CardBody>
                        <CardFooter>
                            <Button><Link href="/rentedflats">View here</Link></Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Image boxSize='50px' src='/icons/save.png' alt='Dan Abramov' />
                        </CardHeader>
                        <CardBody>
                            <Heading size='md'>Saved Socities</Heading>
                        </CardBody>
                        <CardFooter>
                            <Button><Link href="/savedsocities">View here</Link></Button>
                        </CardFooter>
                    </Card> */}
                </SimpleGrid>
            </Container>
        </div >
    )
}

export default Builder;