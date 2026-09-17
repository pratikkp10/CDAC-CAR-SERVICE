"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-5xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    Car Service Dashboard
                </h1>

                {user && (
                    <p className="mt-2 text-gray-600">
                        Welcome, {user.name}!
                    </p>
                )}

                <div className="mt-8 grid gap-6 md:grid-cols-3">

                    {/* My Cars */}

                    <a
                        href="/dashboard/cars"
                        className="block rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
                    >
                        <h2 className="text-xl font-semibold text-gray-800">
    My Cars
</h2>

                        <p className="mt-2 text-gray-600">
                            Manage your registered cars.
                        </p>
                    </a>


                    {/* Services */}

                    <a
                        href="/services"
                        className="block rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
                    >
                        <h2 className="text-xl font-semibold text-gray-800">
    Services
</h2>

                        <p className="mt-2 text-gray-600">
                            View available car services.
                        </p>
                    </a>


                    {/* My Bookings */}

                    {/* My Bookings */}

<a
    href="/dashboard/bookings"
    className="block rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
>
    <h2 className="text-xl font-semibold text-gray-800">
        My Bookings
    </h2>

    <p className="mt-2 text-gray-600">
        View and manage your bookings.
    </p>
</a>

                </div>

            </div>
        </main>
    );
}