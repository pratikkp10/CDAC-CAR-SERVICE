"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

export default function AdminManagementPage() {
    const router = useRouter();

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        const token = getToken();

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

            fetchAdmins(token);
        } catch (error) {
            localStorage.removeItem("token");
            router.push("/login");
        }
    }, []);

    const fetchAdmins = async (token = getToken()) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/admin-management`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load admins");
            }

            setAdmins(data.admins || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            password: "",
            phone: ""
        });

        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name || !form.email) {
            alert("Name and email are required");
            return;
        }

        if (!editingId && !form.password) {
            alert("Password is required for a new admin");
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            const url = editingId
                ? `${API_URL}/api/admin-management/${editingId}`
                : `${API_URL}/api/admin-management`;

            const method = editingId ? "PUT" : "POST";

            const body = editingId
                ? {
                      name: form.name,
                      email: form.email,
                      phone: form.phone
                  }
                : form;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to save admin account"
                );
            }

            alert(
                editingId
                    ? "Admin details updated successfully"
                    : "Admin account created successfully"
            );

            resetForm();
            fetchAdmins(token);
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const startEditing = (admin) => {
        setEditingId(admin.id);

        setForm({
            name: admin.name || "",
            email: admin.email || "",
            password: "",
            phone: admin.phone || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const toggleAdminStatus = async (admin) => {
        const nextStatus = Number(admin.is_active) === 1 ? false : true;

        const action = nextStatus ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this admin account?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/admin-management/${admin.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({
                        is_active: nextStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update admin status"
                );
            }

            alert(data.message);
            fetchAdmins();
        } catch (error) {
            alert(error.message);
        }
    };

    const deleteAdmin = async (admin) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${admin.name}'s account?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/admin-management/${admin.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to delete admin account"
                );
            }

            alert(data.message);
            fetchAdmins();
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-600">
                    Loading Admin Management...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f9fc] p-6 text-gray-800 md:p-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                            Super Admin
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-gray-900">
                            Admin Management
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Create, update and manage administrator accounts.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/superadmin")}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <section className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingId
                                ? "Edit Admin Account"
                                : "Create New Admin"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {editingId
                                ? "Update the selected administrator's details."
                                : "Create a new account with administrator access."}
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Full name"
                            className="rounded-xl border border-gray-200 p-3 outline-none focus:border-blue-500"
                            required
                        />

                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email address"
                            className="rounded-xl border border-gray-200 p-3 outline-none focus:border-blue-500"
                            required
                        />

                        {!editingId && (
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Temporary password"
                                className="rounded-xl border border-gray-200 p-3 outline-none focus:border-blue-500"
                                required
                            />
                        )}

                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Phone number"
                            className="rounded-xl border border-gray-200 p-3 outline-none focus:border-blue-500"
                        />

                        <div className="flex gap-3 md:col-span-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Admin"
                                    : "Create Admin"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 p-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Administrator Accounts
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage existing admin accounts.
                            </p>
                        </div>

                        <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600">
                            {admins.length} Admins
                        </span>
                    </div>

                    {admins.length === 0 ? (
                        <p className="p-6 text-gray-500">
                            No admin accounts found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Admin</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {admins.map((admin) => (
                                        <tr
                                            key={admin.id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-5">
                                                <p className="font-semibold text-gray-900">
                                                    {admin.name}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    ID: {admin.id}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5">
                                                <p className="text-sm text-gray-700">
                                                    {admin.email}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {admin.phone ||
                                                        "No phone number"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        Number(
                                                            admin.is_active
                                                        ) === 1
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {Number(admin.is_active) ===
                                                    1
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() =>
                                                            startEditing(admin)
                                                        }
                                                        className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            toggleAdminStatus(
                                                                admin
                                                            )
                                                        }
                                                        className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                    >
                                                        {Number(
                                                            admin.is_active
                                                        ) === 1
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            deleteAdmin(admin)
                                                        }
                                                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}