import { useRouter } from 'next/router';
import { useContext } from 'react';
import AuthContext from '../stores/AuthContext';

const withoutAuth = (WrappedComponent) => {
    const Wrapper = (props) => {
        const { user } = useContext(AuthContext);
        const router = useRouter();

        if (user) {
            router.replace('/dashboard');
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    return Wrapper;
};

export default withoutAuth;