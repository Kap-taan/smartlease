import { useContext, useState } from "react";
import { ClipLoader } from "react-spinners";
import AuthContext from '../components/stores/AuthContext';
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import withoutAuth from "@/components/routes/PublicRoute";

const Login = () => {


    const { login } = useContext(AuthContext);
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        setLoading(true);
        setError('');
        e.preventDefault();
        let user;
        try {
            user = await login(email, password);
        } catch (error) {
            console.log('Unable to login');
            setError('Unable to login');
            setLoading(false);
            return;
        }

        setEmail('');
        setPassword('');
        setLoading(false);
        router.push('/dashboard');

    }

    return (
        <Layout>
            <div>
                <h3 className="font-bold text-center text-4xl mb-6 text-[#444444]">Login to Agreely</h3>
                {error && <div className="text-center bg-red-500 text-white max-w-lg m-auto py-3 rounded-md"><h5>{error}</h5></div>}
                {loading && <div className="text-center"><ClipLoader color="#425b8b" /></div>}
                <form className="flex flex-col max-w-xl m-auto p-8" onSubmit={submitHandler}>
                    <input className="border border-slate-600 px-2 py-3 rounded-xl mb-10" value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder="Email" />
                    <input className="border border-slate-600 px-2 py-3 rounded-xl mb-10" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                    <button className="border border-slate-600 px-2 py-3 mb-6 rounded-xl bg-[#425b8b] text-white mt-2" type="submit" >Login</button>
                </form>
            </div>
        </Layout>
    )
}

export default withoutAuth(Login);