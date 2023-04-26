import '@fontsource/raleway/400.css'
import '@fontsource/open-sans/700.css'


import { AuthContextProvider } from '@/components/stores/AuthContext'
import { SocietyContextProvider } from '@/components/stores/SocietyContext'
import { ChakraProvider } from '@chakra-ui/react'
import '@/styles/globals.css'
import theme from '@/components/theme'

export default function App({ Component, pageProps }) {
  return <>
    <AuthContextProvider theme={theme}>
      <SocietyContextProvider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </SocietyContextProvider>
    </AuthContextProvider>
  </>
}
