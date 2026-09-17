"use client";

import { useEffect, useState } from "react";

export default function AdminCarsPage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCars = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/cars",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch cars");
                return;
            }

            setCars(data.cars || data);
        } catch (error) {
            console.error("Error fetching cars:", error);
            alert("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    Manage Cars
                </h1>

                <p className="mt-2 text-gray-600">
                    View all customer cars.
                </p>

                <div className="mt-8 overflow-x-auto rounded-xl bg-white p-6 shadow">

                    {loading ? (
                        <p className="text-gray-600">
                            Loading cars...
                        </p>
                    ) : cars.length === 0 ? (
                        <p className="text-gray-600">
                            No cars found.
                        </p>
                    ) : (
                        <table className="w-full min-w-[700px] border-collapse">

                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-3 text-gray-700">
                                        ID
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        User ID
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Brand
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Model
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Registration Number
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {cars.map((car) => (
                                    <tr
                                        key={car.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <td className="p-3 text-gray-600">
                                            {car.id}
                                        </td>

                                        <td className="p-3 text-gray-600">
                                            {car.user_id}
                                        </td>

                                        <td className="p-3 text-gray-800">
                                            {car.brand}
                                        </td>

                                        <td className="p-3 text-gray-800">
                                            {car.model}
                                        </td>

                                        <td className="p-3 text-gray-600">
                                            {car.registration_number}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    )}

                </div>

            </div>
        </main>
    );
}