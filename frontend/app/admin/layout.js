"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.replace("/login");
            return;
        }

        try {
            const user = JSON.parse(userData);

            if (user.role !== "admin") {
                router.replace("/dashboard");
                return;
            }

            setChecking(false);

        } catch (error) {
            console.error("Invalid user data:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            router.replace("/login");
        }

    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.push("/login");
    };

    if (checking) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">
                    Checking admin access...
                </p>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Admin Header */}
            <header className="bg-white shadow-sm">

                <div className="mx-auto max-w-7xl px-6">

                    <div className="flex items-center justify-between py-4">

                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Car Service
                            </h1>

                            <p className="text-sm text-gray-500">
                                Admin Panel
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-md bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                        >
                            Logout
                        </button>

                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-wrap gap-2 border-t py-3">

                        {/* Dashboard */}
                        <Link
                            href="/admin"
                            className={`rounded-md px-4 py-2 ${
                                pathname === "/admin"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Dashboard
                        </Link>

                        {/* Users */}
                        <Link
                            href="/admin/users"
                            className={`rounded-md px-4 py-2 ${
                                pathname.startsWith("/admin/users")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Users
                        </Link>

                        {/* Cars */}
                        <Link
                            href="/admin/cars"
                            className={`rounded-md px-4 py-2 ${
                                pathname.startsWith("/admin/cars")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Cars
                        </Link>

                        {/* Services */}
                        <Link
                            href="/admin/services"
                            className={`rounded-md px-4 py-2 ${
                                pathname.startsWith("/admin/services")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Services
                        </Link>

                        {/* Bookings */}
                        <Link
                            href="/admin/bookings"
                            className={`rounded-md px-4 py-2 ${
                                pathname.startsWith("/admin/bookings")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Bookings
                        </Link>

                    </nav>

                </div>

            </header>

            {/* Current Admin Page */}
            {children}

        </div>
    );
}