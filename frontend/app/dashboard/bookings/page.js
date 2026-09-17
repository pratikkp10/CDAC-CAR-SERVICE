"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BookingsPage() {
    const searchParams = useSearchParams();

    const selectedServiceId = searchParams.get("serviceId");

    const [cars, setCars] = useState([]);
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [carId, setCarId] = useState("");
    const [serviceId, setServiceId] = useState(
        selectedServiceId || ""
    );
    const [bookingDate, setBookingDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    const [editingBooking, setEditingBooking] = useState(null);
const [editingDate, setEditingDate] = useState("");

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/bookings",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            setBookings(data.bookings);

        } catch (error) {
            console.error("Error fetching bookings:", error);

        } finally {
            setBookingsLoading(false);
        }
    };const handleUpdateBooking = async (bookingId) => {
    if (!editingDate) {
        alert("Please select a booking date");
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:5000/api/bookings/${bookingId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    booking_date: editingDate
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Booking updated successfully!");

        setEditingBooking(null);
        setEditingDate("");

        fetchBookings();

    } catch (error) {
        console.error("Error updating booking:", error);
        alert("Unable to connect to server");
    }
};

const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
        "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:5000/api/bookings/${bookingId}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Booking cancelled successfully!");

        fetchBookings();

    } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Unable to connect to server");
    }
};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const carsResponse = await fetch(
                    "http://localhost:5000/api/cars",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const carsData = await carsResponse.json();

                if (!carsResponse.ok) {
                    alert(carsData.message);
                    return;
                }

                const servicesResponse = await fetch(
                    "http://localhost:5000/api/services"
                );

                const servicesData = await servicesResponse.json();

                if (!servicesResponse.ok) {
                    alert(servicesData.message);
                    return;
                }

                setCars(carsData.cars);
                setServices(servicesData.services);

            } catch (error) {
                console.error("Error loading booking data:", error);
                alert("Unable to connect to server");

            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchBookings();
    }, []);

    const handleCreateBooking = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/bookings",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        car_id: carId,
                        service_id: serviceId,
                        booking_date: bookingDate
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Booking created successfully!");

            setCarId("");
            setServiceId("");
            setBookingDate("");

            fetchBookings();

        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Unable to connect to server");
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-5xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    Book a Service
                </h1>

                <p className="mt-2 text-gray-600">
                    Select your car, service and preferred date.
                </p>

                {loading ? (
                    <p className="mt-8 text-gray-600">
                        Loading booking details...
                    </p>
                ) : (
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">

                        <form
                            onSubmit={handleCreateBooking}
                            className="space-y-5"
                        >

                            <div>
                                <label className="block text-gray-700">
                                    Select Car
                                </label>

                                <select
                                    value={carId}
                                    onChange={(e) =>
                                        setCarId(e.target.value)
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white p-3 text-gray-800"
                                    required
                                >
                                    <option value="">
                                        Choose your car
                                    </option>

                                    {cars.map((car) => (
                                        <option
                                            key={car.id}
                                            value={car.id}
                                        >
                                            {car.brand} {car.model} -{" "}
                                            {car.registration_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700">
                                    Select Service
                                </label>

                                <select
                                    value={serviceId}
                                    onChange={(e) =>
                                        setServiceId(e.target.value)
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white p-3 text-gray-800"
                                    required
                                >
                                    <option value="">
                                        Choose a service
                                    </option>

                                    {services.map((service) => (
                                        <option
                                            key={service.id}
                                            value={service.id}
                                        >
                                            {service.name} - ₹{service.price}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700">
                                    Booking Date
                                </label>

                                <input
                                    type="date"
                                    value={bookingDate}
                                    onChange={(e) =>
                                        setBookingDate(e.target.value)
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white p-3 text-gray-800"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-md bg-blue-600 py-3 text-white hover:bg-blue-700"
                            >
                                Confirm Booking
                            </button>

                        </form>

                    </div>
                )}

                <h2 className="mt-10 text-2xl font-semibold text-gray-800">
                    My Bookings
                </h2>

                {bookingsLoading ? (
                    <p className="mt-4 text-gray-600">
                        Loading bookings...
                    </p>
                ) : bookings.length === 0 ? (
                    <p className="mt-4 text-gray-600">
                        You have no bookings yet.
                    </p>
                ) : (
                    <div className="mt-6 grid gap-6 md:grid-cols-2">

                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="rounded-lg bg-white p-6 shadow"
                            >

                                <h3 className="text-xl font-semibold text-gray-800">
                                    {booking.service_name}
                                </h3>

                                <p className="mt-3 text-gray-600">
                                    Car: {booking.brand} {booking.model}
                                </p>
                                {editingBooking === booking.id ? (
    <div className="mt-4 space-y-3">

        <input
            type="date"
            value={editingDate}
            onChange={(e) => setEditingDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white p-3 text-gray-800"
        />

        <div className="flex gap-3">

            <button
                onClick={() => handleUpdateBooking(booking.id)}
                className="flex-1 rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
            >
                Save Date
            </button>

            <button
                onClick={() => {
                    setEditingBooking(null);
                    setEditingDate("");
                }}
                className="flex-1 rounded-md border border-gray-400 py-2 text-gray-700 hover:bg-gray-100"
            >
                Cancel
            </button>

        </div>

    </div>
) : (
    <div className="mt-4 flex gap-3">

        <button
            onClick={() => {
                setEditingBooking(booking.id);
                setEditingDate(
                    new Date(booking.booking_date)
                        .toISOString()
                        .split("T")[0]
                );
            }}
            className="flex-1 rounded-md bg-yellow-500 py-2 text-white hover:bg-yellow-600"
        >
            Edit
        </button>

        <button
            onClick={() => handleCancelBooking(booking.id)}
            className="flex-1 rounded-md bg-red-600 py-2 text-white hover:bg-red-700"
        >
            Cancel
        </button>

    </div>
)}

                                <p className="mt-2 text-gray-600">
                                    Registration:{" "}
                                    {booking.registration_number}
                                </p>

                                <p className="mt-2 text-gray-600">
                                    Booking Date:{" "}
                                    {new Date(
                                        booking.booking_date
                                    ).toLocaleDateString("en-IN")}
                                </p>

                                <p className="mt-2 text-gray-600">
                                    Price: ₹{booking.price}
                                </p>

                                <p className="mt-3 font-semibold text-blue-600">
                                    Status: {booking.status}
                                </p>

                            </div>
                        ))}

                    </div>
                )}

            </div>
        </main>
    );
}