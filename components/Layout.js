import Navbar from "./Navbar";

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'

const Layout = ({ children }) => {
    return (
        <>
            <CacheProvider>
                <ChakraProvider>
                    <div className="max-w-6xl m-auto p-9">
                        <Navbar />
                        {children}
                    </div>
                </ChakraProvider>
            </CacheProvider>
        </>
    );
}

export default Layout;