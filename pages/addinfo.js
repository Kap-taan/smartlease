import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { db } from "../components/data/firebase";
import AuthContext from "../components/stores/AuthContext";
import { MoonLoader } from "react-spinners";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import withAuth from "@/components/routes/PrivateRoute";

const AddInfo = () => {

    const { user } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [cities, setCities] = useState([]);
    const [aadharNo, setAadharNo] = useState('');
    const [areas, setAreas] = useState([]);

    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const getCitiesInfo = async () => {
        setLoading(true);
        try {
            const response = await getDocs(collection(db, "cities"));
            let tempCities = [];
            response.forEach(doc => {
                tempCities = [...tempCities, { id: doc.id, ...doc.data() }]
            })
            setCities(tempCities);
            setAreas(tempCities[0].areas)
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
            return;
        }

    }

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        const city = e.target.city.value.toLocaleLowerCase();
        const area = e.target.area.value.toLocaleLowerCase();
        console.log(city);
        const additionalUserInfo = {
            name, mobileNumber, aadharNo, city, area
        }
        const docRef = doc(db, "users", user.uid);
        try {
            await updateDoc(docRef, additionalUserInfo);
            console.log('Added Successfully');
        } catch (error) {
            console.log(error);
            setLoading(false);
            return;
        }
        setLoading(false);
        // Navigate to dashboard again
        router.push('/dashboard');
    }

    const cityChangeHandler = (e) => {
        const tempAreas = cities.filter(tempcity => tempcity.place === e.target.value.toLocaleLowerCase())[0].areas;
        setAreas(tempAreas);

    }

    useEffect(() => {
        getCitiesInfo();
    }, [])

    return (
        <Layout>
            <div>
                <h4 className="font-bold text-center text-4xl mb-6 text-[#444444]">Additional Info</h4>
                <form onSubmit={submitHandler} className="flex flex-col max-w-xl m-auto p-8">
                    <input className="border border-slate-600 px-2 py-3 rounded-xl mb-8" type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
                    <input className="border border-slate-600 px-2 py-3 rounded-xl mb-8" type="text" placeholder="Aadhar No." value={aadharNo} onChange={e => setAadharNo(e.target.value)} />
                    <input className="border border-slate-600 px-2 py-3 rounded-xl mb-8" type="text" placeholder="Mobile Number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                    {cities.length > 0 && <select name="city" onChange={cityChangeHandler} className="border border-slate-600 px-2 py-3 rounded-xl mb-8" placeholder="Current city">
                        {cities.map(city => (
                            <option key={city.place}>{city.place.toLocaleUpperCase()}</option>
                        ))}
                    </select>}
                    {areas.length > 0 && <select name="area" className="border border-slate-600 px-2 py-3 rounded-xl mb-8" placeholder="Current city">
                        {areas.map(area => (
                            <option key={area}>{area.toLocaleUpperCase()}</option>
                        ))}
                    </select>}
                    {!loading && <button className="border border-slate-600 px-2 py-3 mb-6 rounded-xl bg-[#425b8b] text-white mt-2" type="submit" >Add Info</button>}
                    {loading && <div className="flex justify-center items-center mt-8"><MoonLoader color="#425b8b" /></div>}
                </form>
            </div>
        </Layout>
    )
}

export default withAuth(AddInfo);