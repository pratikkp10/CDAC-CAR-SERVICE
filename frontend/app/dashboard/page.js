"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://localhost:5000";

export default function DashboardPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(`${API_URL}/api/bookings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Unable to load bookings.");
                    return;
                }

                setBookings(data.bookings || []);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                setError("Unable to connect to the server.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        (booking) => booking.status === "pending"
    ).length;

    const completedBookings = bookings.filter(
        (booking) => booking.status === "completed"
    ).length;

    const cancelledBookings = bookings.filter(
        (booking) => booking.status === "cancelled"
    ).length;

    const statistics = [
        {
            title: "Total Bookings",
            value: totalBookings,
            icon: "📅",
            description: "All your service bookings",
            color: "bg-blue-100",
            textColor: "text-blue-700",
        },
        {
            title: "Pending",
            value: pendingBookings,
            icon: "⏳",
            description: "Bookings awaiting service",
            color: "bg-amber-100",
            textColor: "text-amber-700",
        },
        {
            title: "Completed",
            value: completedBookings,
            icon: "✅",
            description: "Successfully completed services",
            color: "bg-emerald-100",
            textColor: "text-emerald-700",
        },
        {
            title: "Cancelled",
            value: cancelledBookings,
            icon: "✕",
            description: "Cancelled service bookings",
            color: "bg-red-100",
            textColor: "text-red-700",
        },
    ];

    const quickActions = [
        {
            title: "My Bookings",
            description: "View and manage your service appointments.",
            icon: "📅",
            href: "/dashboard/bookings",
            buttonText: "View Bookings",
        },
        {
            title: "My Cars",
            description: "Add or manage your registered vehicles.",
            icon: "🚗",
            href: "/dashboard/cars",
            buttonText: "Manage Cars",
        },
        {
            title: "Browse Services",
            description: "Explore available maintenance services.",
            icon: "🔧",
            href: "/services",
            buttonText: "Explore Services",
        },
        {
            title: "My Profile",
            description: "Update your personal information and password.",
            icon: "👤",
            href: "/profile",
            buttonText: "View Profile",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-100">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Welcome Banner */}
                <section className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white shadow-lg sm:p-8">
                    <p className="text-sm font-medium uppercase tracking-wider text-blue-200">
                        Customer Portal
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                        Customer Dashboard
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                        Welcome to your Online Car Service Station dashboard.
                        Manage your vehicles, bookings, and services easily.
                    </p>

                    <Link
                        href="/services"
                        className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-50"
                    >
                        Book a Service →
                    </Link>
                </section>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <section className="mb-10">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">
                            Booking Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Track the current status of your service bookings.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {statistics.map((statistic) => (
                            <div
                                key={statistic.title}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {statistic.title}
                                        </p>

                                        <h3
                                            className={`mt-3 text-4xl font-bold ${statistic.textColor}`}
                                        >
                                            {loading ? (
                                                <span className="inline-block h-10 w-12 animate-pulse rounded bg-slate-200" />
                                            ) : (
                                                statistic.value
                                            )}
                                        </h3>
                                    </div>

                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${statistic.color}`}
                                    >
                                        {statistic.icon}
                                    </div>
                                </div>

                                <p className="mt-4 text-xs leading-5 text-slate-500">
                                    {statistic.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quick Actions */}
                <section>
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold text-slate-800">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Access your most-used customer features.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {quickActions.map((action) => (
                            <Link
                                href={action.href}
                                key={action.title}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl transition group-hover:bg-blue-100">
                                        {action.icon}
                                    </div>

                                    <span className="text-2xl text-slate-300 transition group-hover:text-blue-500">
                                        →
                                    </span>
                                </div>

                                <h3 className="mt-5 text-xl font-bold text-slate-800">
                                    {action.title}
                                </h3>

                                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                                    {action.description}
                                </p>

                                <div className="mt-5 inline-flex rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                                    {action.buttonText}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Information Notice */}
                <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                    <strong>Tip:</strong> Keep your vehicle information updated
                    to make future service bookings easier.
                </div>
            </div>
        </main>
    );
}