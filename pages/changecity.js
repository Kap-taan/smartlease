import { collection, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState, useContext } from "react";
import AuthContext from "../components/stores/AuthContext";
import { doc } from "firebase/firestore";
import { db } from "../components/data/firebase";
import { MoonLoader } from "react-spinners";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import withAuth from "@/components/routes/PrivateRoute";


const ChangeCity = () => {

    const [cities, setCities] = useState([]);
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const [areas, setAreas] = useState([]);

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
            setLoading(false)
            console.log(error);
            return;
        }

    }

    const submitHandler = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            await updateDoc(doc(db, "users", user.uid), {
                city: e.target.city.value.toLocaleLowerCase(),
                area: e.target.area.value.toLocaleLowerCase()
            })
        } catch (error) {
            setLoading(false);
            console.log(error);
            return;
        }

        setLoading(false);
        router.push('/dashboard');
    }

    useEffect(() => {
        getCitiesInfo();
    }, [])

    const cityChangeHandler = (e) => {
        const tempAreas = cities.filter(tempcity => tempcity.place === e.target.value.toLocaleLowerCase())[0].areas;
        setAreas(tempAreas);

    }


    return (
        <Layout>
            <div>
                <h3 className="font-bold text-center text-4xl mb-6 text-[#444444]">Change city</h3>
                {error && <div className="text-center bg-red-500 text-white max-w-lg m-auto py-3 rounded-md"><h5>{error}</h5></div>}
                <form className="flex flex-col max-w-xl m-auto p-8" onSubmit={submitHandler}>
                    {cities.length > 0 && <select name="city" onChange={cityChangeHandler} className="border border-slate-600 px-2 py-3 rounded-xl mb-8" placeholder="Current city">
                        {cities.map(city => (
                            <option key={city.id}>{city.place.toLocaleUpperCase()}</option>
                        ))}
                    </select>}
                    {areas.length > 0 && <select name="area" className="border border-slate-600 px-2 py-3 rounded-xl mb-8" placeholder="Current city">
                        {areas.map(area => (
                            <option key={area}>{area.toLocaleUpperCase()}</option>
                        ))}
                    </select>}
                    {!loading && <button className="border border-slate-600 px-2 py-3 mb-6 rounded-xl bg-[#425b8b] text-white mt-2" type="submit" >Change city</button>}
                    {loading && <div className="flex justify-center items-center mt-8"><MoonLoader color="#425b8b" /></div>}
                </form>
            </div>
        </Layout>
    );
}

export default withAuth(ChangeCity);