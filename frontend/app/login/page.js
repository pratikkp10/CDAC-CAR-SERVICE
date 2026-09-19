"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Invalid email or password");
                return;
            }

            const token = data.token;
            const user = data.user;

            if (!token) {
                alert("Login successful, but token was not received.");
                return;
            }

            // Decode the JWT to get the latest role from the token
            let decodedUser;

            try {
                const payload = JSON.parse(
                    atob(token.split(".")[1])
                );

                decodedUser = {
                    id: payload.id,
                    email: payload.email,
                    role: payload.role,
                };
            } catch (error) {
                console.error("Token decoding failed:", error);

                decodedUser = user;
            }

            // Store the latest authentication details
            localStorage.setItem("token", token);
            localStorage.setItem(
                "user",
                JSON.stringify(decodedUser)
            );

            // Redirect according to the actual role
            if (decodedUser.role === "superadmin") {
                router.replace("/superadmin");
            } else if (decodedUser.role === "admin") {
                router.replace("/admin");
            } else if (decodedUser.role === "customer") {
                router.replace("/dashboard");
            } else {
                alert("Unknown user role. Please contact the administrator.");
                router.replace("/login");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800">
                    Login
                </h1>

                <p className="mt-2 text-gray-600">
                    Login to your car service account.
                </p>

                <form
                    onSubmit={handleLogin}
                    className="mt-6 space-y-5"
                >
                    <div>
                        <label className="block font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            className="mt-2 w-full rounded-md border border-gray-300 p-3 text-gray-800"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="mt-2 w-full rounded-md border border-gray-300 p-3 text-gray-800"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </main>
    );
}