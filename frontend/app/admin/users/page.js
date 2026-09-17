"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch users");
                return;
            }

            setUsers(data.users || data);

        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Unable to connect to server");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-6">

            <div className="mx-auto max-w-6xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    Manage Users
                </h1>

                <p className="mt-2 text-gray-600">
                    View registered users.
                </p>

                <div className="mt-8 overflow-x-auto rounded-xl bg-white p-6 shadow">

                    {loading ? (
                        <p className="text-gray-600">
                            Loading users...
                        </p>

                    ) : users.length === 0 ? (
                        <p className="text-gray-600">
                            No users found.
                        </p>

                    ) : (
                        <table className="w-full min-w-[600px] border-collapse">

                            <thead>
                                <tr className="border-b text-left">

                                    <th className="p-3 text-gray-700">
                                        ID
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Name
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Email
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Role
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b last:border-b-0"
                                    >

                                        <td className="p-3 text-gray-600">
                                            {user.id}
                                        </td>

                                        <td className="p-3 text-gray-800">
                                            {user.name}
                                        </td>

                                        <td className="p-3 text-gray-600">
                                            {user.email}
                                        </td>

                                        <td className="p-3">

                                            <span
                                                className={`rounded-full px-3 py-1 text-sm ${
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {user.role}
                                            </span>

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