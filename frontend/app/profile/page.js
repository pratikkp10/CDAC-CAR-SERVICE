"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function ProfilePage() {
    const [user, setUser] = useState(null);

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [error, setError] = useState("");

    const getToken = () => {
        if (typeof window === "undefined") {
            return "";
        }

        return localStorage.getItem("token");
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/auth/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to fetch profile"
                );
            }

            setUser(data.user);

            setProfileForm({
                name: data.user.name || "",
                email: data.user.email || "",
                phone: data.user.phone || ""
            });

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        } catch (error) {
            console.error("Profile fetch error:", error);
            setError(error.message || "Unable to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = getToken();

        if (!token) {
            setError("Please log in to view your profile.");
            setLoading(false);
            return;
        }

        fetchProfile();
    }, []);

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfileForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        try {
            setProfileSaving(true);

            const response = await fetch(
                `${API_URL}/api/auth/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(profileForm)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update profile");
                return;
            }

            setUser(data.user);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Profile update error:", error);
            alert("Unable to connect to server");
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {
            alert("New passwords do not match");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            alert("New password must contain at least 8 characters");
            return;
        }

        try {
            setPasswordSaving(true);

            const response = await fetch(
                `${API_URL}/api/auth/profile/password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({
                        currentPassword:
                            passwordForm.currentPassword,
                        newPassword:
                            passwordForm.newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to change password");
                return;
            }

            alert("Password changed successfully!");

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Password change error:", error);
            alert("Unable to connect to server");
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <p className="text-gray-700">
                    Loading profile...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow">
                    <p className="text-red-600">{error}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-2 text-3xl font-bold text-gray-800">
                    My Profile
                </h1>

                <p className="mb-8 text-gray-600">
                    View and manage your account details.
                </p>

                {/* Profile Information */}
                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                    <h2 className="mb-5 text-2xl font-semibold text-gray-800">
                        Personal Information
                    </h2>

                    <div className="mb-6 rounded-lg bg-gray-100 p-4">
                        <p className="text-gray-700">
                            <strong>User ID:</strong> {user?.id}
                        </p>

                        <p className="mt-2 text-gray-700">
                            <strong>Role:</strong>{" "}
                            <span className="capitalize">
                                {user?.role}
                            </span>
                        </p>
                    </div>

                    <form
                        onSubmit={handleProfileSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                                required
                                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                                required
                                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Phone Number
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={profileForm.phone}
                                onChange={handleProfileChange}
                                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={profileSaving}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {profileSaving
                                ? "Saving..."
                                : "Update Profile"}
                        </button>
                    </form>
                </section>

                {/* Change Password */}
                <section className="rounded-xl bg-white p-6 shadow">
                    <h2 className="mb-5 text-2xl font-semibold text-gray-800">
                        Change Password
                    </h2>

                    <form
                        onSubmit={handlePasswordSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Current Password
                            </label>

                            <input
                                type="password"
                                name="currentPassword"
                                value={
                                    passwordForm.currentPassword
                                }
                                onChange={handlePasswordChange}
                                required
                                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                New Password
                            </label>

                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={8}
                                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                value={
                                    passwordForm.confirmPassword
                                }
                                onChange={handlePasswordChange}
                                required
                                minLength={8}
                                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="rounded-lg bg-purple-600 px-5 py-3 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            {passwordSaving
                                ? "Changing Password..."
                                : "Change Password"}
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}