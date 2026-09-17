"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPage() {
    const [userCount, setUserCount] = useState(0);
    const [carCount, setCarCount] = useState(0);
    const [serviceCount, setServiceCount] = useState(0);
    const [bookingCount, setBookingCount] = useState(0);

    const [loading, setLoading] = useState(true);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem("token");

            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [
                usersResponse,
                carsResponse,
                servicesResponse,
                bookingsResponse
            ] = await Promise.all([
                fetch("http://localhost:5000/api/admin/users", {
                    headers
                }),

                fetch("http://localhost:5000/api/admin/cars", {
                    headers
                }),

                fetch("http://localhost:5000/api/services"),

                fetch("http://localhost:5000/api/admin/bookings", {
                    headers
                })
            ]);

            const usersData = await usersResponse.json();
            const carsData = await carsResponse.json();
            const servicesData = await servicesResponse.json();
            const bookingsData = await bookingsResponse.json();

            if (!usersResponse.ok) {
                console.error("Unable to fetch users");
            } else {
                setUserCount(
                    (usersData.users || usersData).length
                );
            }

            if (!carsResponse.ok) {
                console.error("Unable to fetch cars");
            } else {
                setCarCount(
                    (carsData.cars || carsData).length
                );
            }

            if (!servicesResponse.ok) {
                console.error("Unable to fetch services");
            } else {
                setServiceCount(
                    (servicesData.services || servicesData).length
                );
            }

            if (!bookingsResponse.ok) {
                console.error("Unable to fetch bookings");
            } else {
                setBookingCount(
                    (bookingsData.bookings || bookingsData).length
                );
            }

        } catch (error) {
            console.error(
                "Error fetching dashboard statistics:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    return (
        <main className="min-h-screen bg-gray-100">

            <div className="mx-auto max-w-7xl p-6">

                {/* Dashboard Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Admin Dashboard
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Overview of the car service application.
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Users */}
                    <div className="rounded-xl bg-white p-6 shadow">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Users
                                </p>

                                <h3 className="mt-2 text-3xl font-bold text-gray-800">
                                    {loading ? "..." : userCount}
                                </h3>
                            </div>

                            <div className="text-4xl">
                                👥
                            </div>

                        </div>
                    </div>

                    {/* Cars */}
                    <div className="rounded-xl bg-white p-6 shadow">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Cars
                                </p>

                                <h3 className="mt-2 text-3xl font-bold text-gray-800">
                                    {loading ? "..." : carCount}
                                </h3>
                            </div>

                            <div className="text-4xl">
                                🚗
                            </div>

                        </div>
                    </div>

                    {/* Services */}
                    <div className="rounded-xl bg-white p-6 shadow">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Services
                                </p>

                                <h3 className="mt-2 text-3xl font-bold text-gray-800">
                                    {loading ? "..." : serviceCount}
                                </h3>
                            </div>

                            <div className="text-4xl">
                                🔧
                            </div>

                        </div>
                    </div>

                    {/* Bookings */}
                    <div className="rounded-xl bg-white p-6 shadow">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Bookings
                                </p>

                                <h3 className="mt-2 text-3xl font-bold text-gray-800">
                                    {loading ? "..." : bookingCount}
                                </h3>
                            </div>

                            <div className="text-4xl">
                                📅
                            </div>

                        </div>
                    </div>

                </div>

                {/* Management Section */}
                <div className="mt-10 mb-6">

                    <h2 className="text-2xl font-bold text-gray-800">
                        Management
                    </h2>

                    <p className="mt-1 text-gray-600">
                        Manage different parts of the application.
                    </p>

                </div>

                {/* Management Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                    {/* Users */}
                    <Link
                        href="/admin/users"
                        className="group rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="text-4xl">
                            👥
                        </div>

                        <h3 className="mt-4 text-xl font-semibold text-gray-800">
                            Users
                        </h3>

                        <p className="mt-2 text-gray-600">
                            Manage registered users.
                        </p>

                        <p className="mt-4 font-medium text-blue-600 group-hover:text-blue-700">
                            Manage Users →
                        </p>
                    </Link>

                    {/* Cars */}
                    <Link
                        href="/admin/cars"
                        className="group rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="text-4xl">
                            🚗
                        </div>

                        <h3 className="mt-4 text-xl font-semibold text-gray-800">
                            Cars
                        </h3>

                        <p className="mt-2 text-gray-600">
                            View and manage customer cars.
                        </p>

                        <p className="mt-4 font-medium text-blue-600 group-hover:text-blue-700">
                            Manage Cars →
                        </p>
                    </Link>

                    {/* Services */}
                    <Link
                        href="/admin/services"
                        className="group rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="text-4xl">
                            🔧
                        </div>

                        <h3 className="mt-4 text-xl font-semibold text-gray-800">
                            Services
                        </h3>

                        <p className="mt-2 text-gray-600">
                            Add and manage car services.
                        </p>

                        <p className="mt-4 font-medium text-blue-600 group-hover:text-blue-700">
                            Manage Services →
                        </p>
                    </Link>

                    {/* Bookings */}
                    <Link
                        href="/admin/bookings"
                        className="group rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="text-4xl">
                            📅
                        </div>

                        <h3 className="mt-4 text-xl font-semibold text-gray-800">
                            Bookings
                        </h3>

                        <p className="mt-2 text-gray-600">
                            View and manage bookings.
                        </p>

                        <p className="mt-4 font-medium text-blue-600 group-hover:text-blue-700">
                            Manage Bookings →
                        </p>
                    </Link>

                </div>

            </div>

        </main>
    );
}