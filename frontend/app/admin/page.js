"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function AdminPage() {
    const [stats, setStats] = useState({
        users: 0,
        cars: 0,
        services: 0,
        bookings: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [
                usersResponse,
                carsResponse,
                servicesResponse,
                bookingsResponse,
            ] = await Promise.all([
                fetch(`${API_URL}/api/admin/users`, { headers }),
                fetch(`${API_URL}/api/admin/cars`, { headers }),
                fetch(`${API_URL}/api/services`),
                fetch(`${API_URL}/api/admin/bookings`, { headers }),
            ]);

            const usersData = await usersResponse.json();
            const carsData = await carsResponse.json();
            const servicesData = await servicesResponse.json();
            const bookingsData = await bookingsResponse.json();

            if (
                !usersResponse.ok ||
                !carsResponse.ok ||
                !servicesResponse.ok ||
                !bookingsResponse.ok
            ) {
                throw new Error("Unable to load dashboard statistics.");
            }

            const users = usersData.users || usersData;
            const cars = carsData.cars || carsData;
            const services = servicesData.services || servicesData;
            const bookings = bookingsData.bookings || bookingsData;

            setStats({
                users: Array.isArray(users) ? users.length : 0,
                cars: Array.isArray(cars) ? cars.length : 0,
                services: Array.isArray(services) ? services.length : 0,
                bookings: Array.isArray(bookings) ? bookings.length : 0,
            });
        } catch (err) {
            console.error("Dashboard error:", err);
            setError("Unable to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const statisticCards = [
        {
            title: "Total Users",
            value: stats.users,
            icon: "👥",
            description: "Registered customers and users",
            link: "/admin/users",
            iconBackground: "bg-blue-100",
        },
        {
            title: "Total Cars",
            value: stats.cars,
            icon: "🚗",
            description: "Vehicles registered in the system",
            link: "/admin/cars",
            iconBackground: "bg-emerald-100",
        },
        {
            title: "Total Services",
            value: stats.services,
            icon: "🔧",
            description: "Available car maintenance services",
            link: "/admin/services",
            iconBackground: "bg-amber-100",
        },
        {
            title: "Total Bookings",
            value: stats.bookings,
            icon: "📅",
            description: "Customer service appointments",
            link: "/admin/bookings",
            iconBackground: "bg-purple-100",
        },
    ];

    const managementCards = [
        {
            title: "Users",
            description: "Manage registered customers and user accounts.",
            icon: "👥",
            link: "/admin/users",
            buttonText: "Manage Users",
        },
        {
            title: "Cars",
            description: "View and manage customer vehicle information.",
            icon: "🚗",
            link: "/admin/cars",
            buttonText: "Manage Cars",
        },
        {
            title: "Services",
            description: "Add, update, and manage available services.",
            icon: "🔧",
            link: "/admin/services",
            buttonText: "Manage Services",
        },
        {
            title: "Bookings",
            description: "Track appointments and update booking statuses.",
            icon: "📅",
            link: "/admin/bookings",
            buttonText: "Manage Bookings",
        },
        {
            title: "Stations",
            description: "Manage service stations and station-specific prices.",
            icon: "🏢",
            link: "/admin/stations",
            buttonText: "Manage Stations",
        },
        {
            title: "Profile",
            description: "Update your personal information and password.",
            icon: "👤",
            link: "/profile",
            buttonText: "View Profile",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-100">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Page Header */}
                <section className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white shadow-lg sm:p-8">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                        <div>
                            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-200">
                                Management Console
                            </p>

                            <h1 className="text-3xl font-bold text-white sm:text-4xl">
                                Admin Dashboard
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                                Monitor and manage your car service station
                                operations from one place.
                            </p>
                        </div>

                        <button
                            onClick={fetchDashboardStats}
                            disabled={loading}
                            className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Refreshing..." : "↻ Refresh Data"}
                        </button>
                    </div>
                </section>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Statistics Heading */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                        System Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        A quick summary of your application data.
                    </p>
                </div>

                {/* Statistics Cards */}
                <section className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {statisticCards.map((card) => (
                        <Link
                            href={card.link}
                            key={card.title}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {card.title}
                                    </p>

                                    <h3 className="mt-3 text-4xl font-bold text-slate-800">
                                        {loading ? (
                                            <span className="inline-block h-10 w-12 animate-pulse rounded bg-slate-200" />
                                        ) : (
                                            card.value
                                        )}
                                    </h3>
                                </div>

                                <div
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${card.iconBackground}`}
                                >
                                    {card.icon}
                                </div>
                            </div>

                            <p className="mt-4 text-xs leading-5 text-slate-500">
                                {card.description}
                            </p>

                            <div className="mt-4 text-sm font-semibold text-blue-600 transition group-hover:text-blue-800">
                                View details →
                            </div>
                        </Link>
                    ))}
                </section>

                {/* Management Heading */}
                <section className="mb-5">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Management
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Select a module to manage your car service application.
                    </p>
                </section>

                {/* Management Cards */}
                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {managementCards.map((card) => (
                        <Link
                            href={card.link}
                            key={card.title}
                            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl transition group-hover:bg-blue-100">
                                    {card.icon}
                                </div>

                                <span className="text-2xl text-slate-300 transition group-hover:text-blue-500">
                                    →
                                </span>
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-slate-800">
                                {card.title}
                            </h3>

                            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                                {card.description}
                            </p>

                            <div className="mt-5 inline-flex rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                                {card.buttonText}
                            </div>
                        </Link>
                    ))}
                </section>

                {/* Footer Information */}
                <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                    <strong>Admin tip:</strong> Use the navigation sidebar to
                    quickly access each management module.
                </div>
            </div>
        </main>
    );
}