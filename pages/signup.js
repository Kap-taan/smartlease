import { useContext, useState } from "react";
import AuthContext from "../components/stores/AuthContext";
import app, { db } from "../components/data/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { getAuth, deleteUser } from "firebase/auth";
import { ClipLoader } from "react-spinners";
import Layout from "@/components/Layout";
import withoutAuth from "@/components/routes/PublicRoute";


const Signup = () => {

    const { signup } = useContext(AuthContext);

    const auth = getAuth(app);

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        setLoading(true);
        setError('');
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Password does not match');
            setLoading(false);
            return;
        }

        let user;
        try {
            user = await signup(email, password);
            console.log(user.user.uid);
        } catch (err) {
            setError('Cannot create new user');
            setLoading(false);
            return;
        }

        // Add this user to the database and set the role as client
        try {
            await setDoc(doc(db, "users", user.user.uid), {
                uid: user.user.uid,
                email: user.user.email,
                role: 'Client'
            });
        } catch (error) {
            const user1 = auth.currentUser;
            localStorage.removeItem(user.user.uid);
            await deleteUser(user1);
            console.log('User Deleted Successfully');
            setLoading(false);
            setError('Cannot create new user')
            return;
        }

        setEmail('');
        setPassword('');
        setConfirmPassword('');
        console.log('Signup is successful');
        setLoading(false);
        router.push('/dashboard');
    }

    return (
        <Layout>
            <div>
                <h3 className="font-bold text-center text-4xl mb-6 text-[#444444]">Signup to Agreely</h3>
                {error && <div className="text-center bg-red-500 text-white max-w-lg m-auto py-3 rounded-md"><h5>{error}</h5></div>}
                {loading && <div className="text-center"><ClipLoader color="#425b8b" /></div>}
                <form onSubmit={submitHandler} className="flex flex-col max-w-xl m-auto p-8">
                    <input className="border border-slate-600 px-2 py-3 rounded-xl mb-8" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                    <input className="border border-slate-600 px-2 py-3 rounded-xl mb-8" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                    <input className="border border-slate-600 px-2 py-3 rounded-xl mb-8" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" />
                    <button className="border border-slate-600 px-2 py-3 mb-6 rounded-xl bg-[#425b8b] text-white mt-2" type="submit" >Signup</button>
                </form>
            </div>
        </Layout>
    );
}

export default withoutAuth(Signup);