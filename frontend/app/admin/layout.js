"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    const [checking, setChecking] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
    const checkAdminAccess = () => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            setChecking(false);
            router.replace("/login");
            return;
        }

        try {
            const user = JSON.parse(userData);
            const role = String(user.role || "").toLowerCase().trim();

            if (role !== "admin" && role !== "superadmin") {
                setChecking(false);
                router.replace("/dashboard");
                return;
            }

            setChecking(false);
        } catch (error) {
            console.error("Invalid user data:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setChecking(false);
            router.replace("/login");
        }
    };

    checkAdminAccess();
}, [router]);

    const navigationItems = [
        {
            name: "Dashboard",
            path: "/admin",
            icon: "▦"
        },
        {
            name: "Users",
            path: "/admin/users",
            icon: "👥"
        },
        {
            name: "Cars",
            path: "/admin/cars",
            icon: "🚗"
        },
        {
            name: "Services",
            path: "/admin/services",
            icon: "🔧"
        },
        {
            name: "Bookings",
            path: "/admin/bookings",
            icon: "📅"
        },
        {
            name: "Stations",
            path: "/admin/stations",
            icon: "🏢"
        },
        {
            name: "Profile",
            path: "/profile",
            icon: "👤"
        }
    ];

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-slate-600">Checking admin access...</p>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Mobile Header */}
            <header className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white lg:hidden">
                <div>
                    <h1 className="text-xl font-bold">Car Service</h1>
                    <p className="text-xs text-slate-300">Admin Panel</p>
                </div>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-xl"
                >
                    ☰
                </button>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 min-h-screen w-72 bg-slate-900 text-white transition-transform duration-300 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                } lg:translate-x-0`}
            >
                <div className="border-b border-slate-700 px-6 py-6">
                    <h1 className="text-2xl font-bold tracking-wide">
                        Car Service
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Management System
                    </p>
                </div>

                <nav className="mt-6 space-y-2 px-4">
                    {navigationItems.map((item) => {
                        const isActive =
                            item.path === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <span className="w-6 text-lg">
                                    {item.icon}
                                </span>

                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full border-t border-slate-700 p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                />
            )}

            {/* Main Content */}
            <div className="min-h-screen lg:ml-72">
                <header className="hidden items-center justify-between border-b bg-white px-8 py-5 shadow-sm lg:flex">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Admin Workspace
                        </h2>

                        <p className="text-sm text-slate-500">
                            Manage your car service operations
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}