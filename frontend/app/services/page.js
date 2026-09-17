"use client";

import { useEffect, useState } from "react";

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/services"
                );

                const data = await response.json();

                setServices(data.services);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-6xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    Available Services
                </h1>

                <p className="mt-2 text-gray-600">
                    Choose the service your car needs.
                </p>

                {loading ? (
                    <p className="mt-8 text-gray-600">
                        Loading services...
                    </p>
                ) : (
                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="rounded-lg bg-white p-6 shadow"
                            >
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {service.name}
                                </h2>

                                <p className="mt-3 text-gray-600">
                                    {service.description}
                                </p>

                                <p className="mt-4 text-lg font-bold text-blue-600">
                                    ₹{service.price}
                                </p>

                                <a
    href={`/dashboard/bookings?serviceId=${service.id}`}
    className="mt-4 block w-full rounded-md bg-blue-600 py-2 text-center text-white hover:bg-blue-700"
>
    Book Service
</a>
                            </div>
                        ))}

                    </div>
                )}

            </div>
        </main>
    );
}