import { useContext } from "react";
import Link from "next/link";
import AuthContext from './stores/AuthContext';
import { Button, ButtonGroup } from "@chakra-ui/react";

const Navbar = () => {

    const { user, logout, additionalInfo } = useContext(AuthContext);

    return (
        <div className="pb-9">
            <nav className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="w-16"><img className="w-14" src="/logo.svg" alt="Logo" /></Link>
                    <Link href="/"><h1 className="font-medium">Agreely</h1></Link>
                </div>
                <ul className="flex">
                    <ButtonGroup spacing={4}>
                        {!user && <Link href='/signup'><Button colorScheme="blue" variant='outline' _hover={{ backgroundColor: "blue.600", color: "white" }} >Signup</Button></Link>}
                        {!user && <Link href='/login'><Button colorScheme="blue" variant='outline' _hover={{ backgroundColor: "blue.600", color: "white" }} >Login</Button></Link>}
                        {user && additionalInfo !== null && <li className="flex justify-center items-center mr-5 text-[#444444]">{additionalInfo.email}</li>}
                        {user && <Button colorScheme="blue" variant='outline' _hover={{ backgroundColor: "blue.600", color: "white" }} onClick={logout}>Logout</Button>}
                    </ButtonGroup>
                </ul>
            </nav>
        </div>
    );
}

export default Navbar;

// max-w-6xl m-auto p-9

// className="px-8 py-3 border rounded-xl bg-[#425b8b] text-white cursor-pointer"