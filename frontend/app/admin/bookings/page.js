"use client";

import { useEffect, useState } from "react";

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/bookings",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch bookings");
                return;
            }

            setBookings(data.bookings || data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            alert("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId, status) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/admin/bookings/${bookingId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update booking");
                return;
            }

            alert("Booking status updated successfully!");

            fetchBookings();
        } catch (error) {
            console.error("Error updating booking:", error);
            alert("Unable to connect to server");
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    Manage Bookings
                </h1>

                <p className="mt-2 text-gray-600">
                    View and manage all customer bookings.
                </p>

                <div className="mt-8 overflow-x-auto rounded-xl bg-white p-6 shadow">

                    {loading ? (
                        <p className="text-gray-600">
                            Loading bookings...
                        </p>
                    ) : bookings.length === 0 ? (
                        <p className="text-gray-600">
                            No bookings found.
                        </p>
                    ) : (
                        <table className="w-full min-w-[1000px] border-collapse">

                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-3 text-gray-700">
                                        ID
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Customer
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Email
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Car
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Registration
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Service
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Date
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Status
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {bookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <td className="p-3 text-gray-600">
                                            {booking.id}
                                        </td>

                                        <td className="p-3 text-gray-800">
                                            {booking.customer_name}
                                        </td>

                                        <td className="p-3 text-gray-600">
                                            {booking.email}
                                        </td>

                                        <td className="p-3 text-gray-800">
                                            {booking.brand} {booking.model}
                                        </td>

                                        <td className="p-3 text-gray-600">
                                            {booking.registration_number}
                                        </td>

                                        <td className="p-3 text-gray-800">
                                            {booking.service_name}
                                        </td>

                                        <td className="p-3 text-gray-600">
                                            {new Date(
                                                booking.booking_date
                                            ).toLocaleDateString()}
                                        </td>

                                        <td className="p-3">
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                                {booking.status}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            <select
                                                value={booking.status}
                                                onChange={(e) =>
                                                    updateBookingStatus(
                                                        booking.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="rounded-md border border-gray-300 bg-white p-2 text-gray-800"
                                            >
                                                <option value="pending">
                                                    Pending
                                                </option>

                                                <option value="confirmed">
                                                    Confirmed
                                                </option>

                                                <option value="completed">
                                                    Completed
                                                </option>

                                                <option value="cancelled">
                                                    Cancelled
                                                </option>
                                            </select>
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