"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        const trimmedEmail = email.trim().toLowerCase();

        // Frontend validation
        if (!trimmedEmail || !password) {
            setError("Please enter both email and password.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: trimmedEmail,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid email or password.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            alert("Login successful!");

            if (data.user.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }

        } catch (error) {
            console.error("Login error:", error);
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
                    Login
                </h1>

                <p className="mt-2 text-center text-gray-500">
                    Car Service
                </p>

                {error && (
                    <div className="mt-5 rounded-md bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-6">

                    <label className="block text-gray-700">
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
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="mt-2 w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-md bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-blue-600 hover:text-blue-700"
                    >
                        Register here
                    </Link>
                </p>

            </div>
        

        </main>
    );
}