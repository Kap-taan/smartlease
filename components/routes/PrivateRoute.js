import { useRouter } from 'next/router';
import { useContext } from 'react';
import AuthContext from '../stores/AuthContext';

const withAuth = (WrappedComponent) => {
    const Wrapper = (props) => {
        const { user } = useContext(AuthContext);
        const router = useRouter();

        // if (loading) {
        //   return <div>Loading...</div>;
        // }

        // if (error) {
        //   console.error(error);
        //   return <div>An error occurred</div>;
        // }

        if (!user) {
            router.replace('/login');
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    return Wrapper;
};

export default withAuth;