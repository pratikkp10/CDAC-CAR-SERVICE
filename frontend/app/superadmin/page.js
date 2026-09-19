"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

export default function SuperAdminPage() {
    const router = useRouter();

    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingUserId, setUpdatingUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));

            if (payload.role !== "superadmin") {
                router.push("/dashboard");
                return;
            }

            fetchSuperAdminData(token);
        } catch (err) {
            localStorage.removeItem("token");
            router.push("/login");
        }
    }, []);

    const fetchSuperAdminData = async (token = localStorage.getItem("token")) => {
        try {
            setLoading(true);
            setError("");

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [statsResponse, usersResponse, bookingsResponse] =
                await Promise.all([
                    fetch(`${API_URL}/api/superadmin/stats`, { headers }),
                    fetch(`${API_URL}/api/superadmin/users`, { headers }),
                    fetch(`${API_URL}/api/superadmin/bookings`, { headers }),
                ]);

            if (!statsResponse.ok || !usersResponse.ok || !bookingsResponse.ok) {
                throw new Error("Unable to load Super Admin data");
            }

            const statsData = await statsResponse.json();
            const usersData = await usersResponse.json();
            const bookingsData = await bookingsResponse.json();

            setStats(statsData.statistics || {});
            setUsers(usersData.users || usersData || []);
            setBookings(bookingsData.bookings || bookingsData || []);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, role) => {
        try {
            setUpdatingUserId(userId);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/superadmin/users/${userId}/role`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ role }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update role");
            }

            await fetchSuperAdminData(token);
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const formatStatus = (status) => {
        return String(status || "unknown")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const getStatusClass = (status) => {
        const value = String(status || "").toLowerCase();

        if (value === "completed") {
            return "bg-emerald-100 text-emerald-700";
        }

        if (value === "cancelled") {
            return "bg-red-100 text-red-700";
        }

        if (value === "in_progress") {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-amber-100 text-amber-700";
    };

    const getRoleClass = (role) => {
        if (role === "superadmin") {
            return "bg-purple-100 text-purple-700";
        }

        if (role === "admin") {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-gray-100 text-gray-700";
    };

    const getInitials = (name) => {
        if (!name) return "U";

        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="text-gray-600">Loading Super Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap");

                body {
                    font-family: "Poppins", sans-serif;
                    background: #f7f9fc;
                }
            `}</style>

            <main className="min-h-screen bg-[#f7f9fc] text-gray-800">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 lg:px-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-200">
                                CS
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Car Service
                                </h1>
                                <p className="text-xs font-medium text-gray-500">
                                    Super Admin Control Center
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-gray-800">
                                    Super Administrator
                                </p>
                                <p className="text-xs text-gray-500">
                                    Full system access
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                                SA
                            </div>

                            <button
                                onClick={logout}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
                    {/* Welcome Section */}
                    <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl shadow-blue-100">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div>
                                <p className="mb-2 text-sm font-medium text-blue-100">
                                    SYSTEM OVERVIEW
                                </p>

                                <h2 className="text-3xl font-bold">
                                    Executive Dashboard
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm text-blue-100">
                                    Monitor platform activity, manage user roles,
                                    and oversee the complete car service
                                    ecosystem.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
    <button
        onClick={() => fetchSuperAdminData()}
        className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-md transition hover:bg-blue-50"
    >
        Refresh Data
    </button>

    <button
        onClick={() => router.push("/superadmin/admin-management")}
        className="rounded-xl bg-indigo-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-950"
    >
        Admin Management
    </button>
</div>
                        </div>
                    </section>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Main Statistics */}
                    <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers || 0}
                            subtitle="Registered platform users"
                            icon="👥"
                            iconClass="bg-blue-100 text-blue-600"
                        />

                        <StatCard
                            title="Total Bookings"
                            value={stats.totalBookings || 0}
                            subtitle="All service bookings"
                            icon="📅"
                            iconClass="bg-indigo-100 text-indigo-600"
                        />

                        <StatCard
                            title="Active Stations"
                            value={stats.totalActiveStations || 0}
                            subtitle="Currently active stations"
                            icon="🏢"
                            iconClass="bg-emerald-100 text-emerald-600"
                        />

                        <StatCard
                            title="Total Revenue"
                            value={`₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}`}
                            subtitle="Recorded platform revenue"
                            icon="₹"
                            iconClass="bg-amber-100 text-amber-600"
                        />
                    </section>

                    {/* Booking Analytics */}
                    <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Booking Analytics
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Current booking status overview
                                    </p>
                                </div>

                                <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                                    Live Data
                                </div>
                            </div>

                            <AnalyticsBar
                                label="Pending Bookings"
                                value={stats.pendingBookings || 0}
                                total={stats.totalBookings || 0}
                                barClass="bg-amber-500"
                            />

                            <AnalyticsBar
                                label="Completed Bookings"
                                value={stats.completedBookings || 0}
                                total={stats.totalBookings || 0}
                                barClass="bg-emerald-500"
                            />

                            <AnalyticsBar
                                label="Cancelled Bookings"
                                value={stats.cancelledBookings || 0}
                                total={stats.totalBookings || 0}
                                barClass="bg-red-500"
                            />
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-xl">
                                🛡️
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">
                                Administrative Access
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                You have complete access to user management,
                                role assignment, booking monitoring, and
                                platform statistics.
                            </p>

                            <div className="mt-6 rounded-2xl bg-purple-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                                    Access Level
                                </p>

                                <p className="mt-1 text-xl font-bold text-purple-800">
                                    Super Admin
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* User Management */}
                    <section className="mb-8 rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    User & Role Management
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Manage access levels for registered users
                                </p>
                            </div>

                            <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                                {users.length} Users
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Current Role</th>
                                        <th className="px-6 py-4">Change Role</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                                        {getInitials(user.name)}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {user.name || "Unnamed User"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ID: {user.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700">
                                                    {user.email}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {user.phone || "No phone number"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                                                        user.role
                                                    )}`}
                                                >
                                                    {formatStatus(user.role)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                {user.role === "superadmin" ? (
                                                    <span className="text-xs font-semibold text-gray-400">
                                                        Protected Account
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={user.role}
                                                        disabled={
                                                            updatingUserId === user.id
                                                        }
                                                        onChange={(event) =>
                                                            updateUserRole(
                                                                user.id,
                                                                event.target.value
                                                            )
                                                        }
                                                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                                                    >
                                                        <option value="customer">
                                                            Customer
                                                        </option>
                                                        <option value="admin">
                                                            Admin
                                                        </option>
                                                        <option value="superadmin">
                                                            Super Admin
                                                        </option>
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Booking Monitoring */}
                    <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Booking Monitoring
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Overview of recent service bookings
                                </p>
                            </div>

                            <span className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600">
                                {bookings.length} Bookings
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Booking</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Service</th>
                                        <th className="px-6 py-4">Station</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((booking) => (
                                        <tr
                                            key={booking.id || booking.bookingId}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                #{booking.id || booking.bookingId}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {booking.customerName ||
                                                    booking.userName ||
                                                    booking.name ||
                                                    "N/A"}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {booking.serviceName ||
                                                    booking.service ||
                                                    "N/A"}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {booking.stationName || "N/A"}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {booking.booking_date
                                                    ? String(booking.booking_date).split("T")[0]
                                                    : "N/A"}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                ₹{Number(
                                                    booking.price ||
                                                        booking.amount ||
                                                        0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                        booking.status
                                                    )}`}
                                                >
                                                    {formatStatus(booking.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <footer className="py-8 text-center text-xs text-gray-400">
                        Car Service Platform · Super Admin Control Center
                    </footer>
                </div>
            </main>
        </>
    );
}

function StatCard({ title, value, subtitle, icon, iconClass }) {
    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900">
                        {value}
                    </h3>
                </div>

                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold ${iconClass}`}
                >
                    {icon}
                </div>
            </div>

            <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
    );
}

function AnalyticsBar({ label, value, total, barClass }) {
    const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

    return (
        <div className="mb-6 last:mb-0">
            <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-semibold text-gray-900">
                    {value}
                </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                    className={`h-full rounded-full transition-all ${barClass}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}