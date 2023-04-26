import app from "../components/data/firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { db } from "../components/data/firebase";
import AuthContext from "../components/stores/AuthContext";
import { MoonLoader } from "react-spinners";
import Client from "../components/Client";
import Layout from "@/components/Layout";
import PrivateAuth from "@/components/routes/PrivateRoute";
import withAuth from "@/components/routes/PrivateRoute";

const Dashboard = () => {

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, addAdditionalInfo } = useContext(AuthContext);

    const auth = getAuth(app);

    const getUserInfo = async () => {
        if (user) {
            // Get the data about the role of the user
            const response = await getDoc(doc(db, "users", user.uid));
            if (response.exists()) {
                addAdditionalInfo(response.data())
                setCurrentUser(response.data());
            }
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user)
            getUserInfo()
    }, [user])

    return (
        <Layout>
            <div>
                {loading && <div className="flex justify-center items-center mt-8"><MoonLoader color="#425b8b" /></div>}
                {!loading && currentUser && currentUser.role === 'Client' && <Client />}
                {!loading && currentUser && currentUser.role === 'Builder' && <p className="text-center">Builder Dashboard</p>}
            </div>
        </Layout>
    )
}

export default withAuth(Dashboard);