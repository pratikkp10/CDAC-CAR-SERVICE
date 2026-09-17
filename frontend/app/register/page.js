"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPhone = phone.trim();

        // Frontend validation
        if (
            !trimmedName ||
            !trimmedEmail ||
            !trimmedPhone ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (trimmedName.length < 3) {
            setError("Name must contain at least 3 characters.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!/^[0-9]{10}$/.test(trimmedPhone)) {
            setError("Phone number must contain exactly 10 digits.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                        email: trimmedEmail,
                        phone: trimmedPhone,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed.");
                return;
            }

            setSuccess("Registration successful! Redirecting to login...");

            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (error) {
            console.error("Registration error:", error);
            setError(
                "Unable to connect to the server. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">

                <h1 className="text-center text-3xl font-bold text-gray-800">
                    Register
                </h1>

                <p className="mt-2 text-center text-gray-500">
                    Create your Car Service account
                </p>

                {error && (
                    <div className="mt-5 rounded-md bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-5 rounded-md bg-green-100 p-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister} className="mt-6">

                    <label className="block text-gray-700">
                        Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="mt-2 w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
                        required
                    />

                    <label className="mt-4 block text-gray-700">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="mt-2 w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
                        required
                    />

                    <label className="mt-4 block text-gray-700">
                        Phone
                    </label>

                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your 10-digit phone number"
                        maxLength={10}
                        className="mt-2 w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
                        required
                    />

                    <label className="mt-4 block text-gray-700">
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="mt-2 w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
                        required
                    />

                    <label className="mt-4 block text-gray-700">
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="mt-2 w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-md bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-blue-600 hover:text-blue-700"
                    >
                        Login here
                    </Link>
                </p>

            </div>

        </main>
    );
}