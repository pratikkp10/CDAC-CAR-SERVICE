"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BookingsPage() {
    const searchParams = useSearchParams();

    const selectedServiceId = searchParams.get("serviceId");
    const selectedStationId = searchParams.get("stationId");

    const [cars, setCars] = useState([]);
    const [services, setServices] = useState([]);
    const [stations, setStations] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [carId, setCarId] = useState("");
    const [serviceId, setServiceId] = useState(selectedServiceId || "");
    const [stationId, setStationId] = useState(selectedStationId || "");
    const [bookingDate, setBookingDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    const [editingBooking, setEditingBooking] = useState(null);
    const [editingDate, setEditingDate] = useState("");

    const [receipt, setReceipt] = useState(null);
    const [receiptLoading, setReceiptLoading] = useState(false);

    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    const token = () => localStorage.getItem("token");

    const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

    // BOOKING HISTORY FUNCTION
    // This function was added directly inside the BookingsPage component.
    const fetchBookingHistory = async (bookingId) => {
        setHistoryLoading(true);
        setSelectedBookingId(bookingId);

        try {
            const response = await fetch(
                `http://localhost:5000/api/booking-history/${bookingId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token()}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch booking history"
                );
            }

            setHistory(data.history || []);
        } catch (error) {
            console.error("Booking history error:", error);
            alert(error.message);
            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/bookings",
                {
                    headers: {
                        Authorization: `Bearer ${token()}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch bookings");
                return;
            }

            setBookings(data.bookings || data || []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchReceipt = async (bookingId) => {
        try {
            setReceiptLoading(true);
            setReceipt(null);

            const response = await fetch(
                `http://localhost:5000/api/receipts/booking/${bookingId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token()}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Receipt not found");
                return;
            }

            setReceipt(data.receipt);
        } catch (error) {
            console.error("Error fetching receipt:", error);
            alert("Unable to fetch receipt");
        } finally {
            setReceiptLoading(false);
        }
    };

    const handleCreateBooking = async (event) => {
        event.preventDefault();
if (!bookingDate || bookingDate < getTodayDate()) {
    alert("Please select today or a future booking date.");
    return;
}
        if (!stationId) {
            alert("Please select a service station");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/bookings",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token()}`,
                    },
                    body: JSON.stringify({
                        car_id: carId,
                        service_id: serviceId,
                        stationId,
                        booking_date: bookingDate,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to create booking");
                return;
            }

            alert("Booking created successfully!");

            setCarId("");
            setServiceId("");
            setStationId("");
            setBookingDate("");

            fetchBookings();
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Unable to connect to server");
        }
    };

    const handleUpdateBooking = async (bookingId) => {
        if (!editingDate || editingDate < getTodayDate()) {
    alert("Please select today or a future booking date.");
    return;
}

        try {
            const response = await fetch(
                `http://localhost:5000/api/bookings/${bookingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token()}`,
                    },
                    body: JSON.stringify({
                        booking_date: editingDate,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update booking");
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
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/bookings/${bookingId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token()}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to cancel booking");
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
                const carsResponse = await fetch(
                    "http://localhost:5000/api/cars",
                    {
                        headers: {
                            Authorization: `Bearer ${token()}`,
                        },
                    }
                );

                const carsData = await carsResponse.json();

                if (!carsResponse.ok) {
                    alert(carsData.message);
                    return;
                }

                const stationsResponse = await fetch(
                    "http://localhost:5000/api/stations"
                );

                const stationsData = await stationsResponse.json();

                if (!stationsResponse.ok) {
                    alert(stationsData.message);
                    return;
                }

                const servicesResponse = await fetch(
                    selectedStationId
                        ? `http://localhost:5000/api/services/station/${selectedStationId}`
                        : "http://localhost:5000/api/services"
                );

                const servicesData = await servicesResponse.json();

                if (!servicesResponse.ok) {
                    alert(servicesData.message);
                    return;
                }

                setCars(carsData.cars || []);
                setStations(stationsData.stations || stationsData || []);
                setServices(servicesData.services || servicesData || []);
            } catch (error) {
                console.error("Error loading booking data:", error);
                alert("Unable to connect to server");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchBookings();
    }, [selectedStationId]);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-800">
                    Book a Service
                </h1>

                <p className="mt-2 text-gray-600">
                    Select your car, station, service and preferred date.
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
                                    onChange={(event) =>
                                        setCarId(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white p-3 text-gray-800"
                                    required
                                >
                                    <option value="">
                                        Choose your car
                                    </option>

                                    {cars.map((car) => (
                                        <option key={car.id} value={car.id}>
                                            {car.brand} {car.model} -{" "}
                                            {car.registration_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700">
                                    Select Station
                                </label>

                                <select
                                    value={stationId}
                                    onChange={(event) =>
                                        setStationId(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white p-3 text-gray-800"
                                    required
                                >
                                    <option value="">
                                        Choose a station
                                    </option>

                                    {stations.map((station) => (
                                        <option
                                            key={station.id}
                                            value={station.id}
                                        >
                                            {station.name} - {station.address}
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
                                    onChange={(event) =>
                                        setServiceId(event.target.value)
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
                                            {service.name} - ₹
                                            {service.stationPrice ??
                                                service.price}
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
    min={getTodayDate()}
    value={bookingDate}
    onChange={(event) =>
        setBookingDate(event.target.value)
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
                    <div className="mt-5 overflow-x-auto rounded-lg bg-white p-6 shadow">
                        <table className="w-full min-w-[1500px] border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Car</th>
                                    <th className="p-3">Station</th>
                                    <th className="p-3">Service</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                    <th className="p-3">Receipt</th>
                                    <th className="p-3">History</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="border-b"
                                    >
                                        <td className="p-3">{booking.id}</td>

                                        <td className="p-3">
                                            {booking.brand} {booking.model}
                                            <br />
                                            <span className="text-sm text-gray-500">
                                                {booking.registration_number}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            {booking.station_name ||
                                                "Not assigned"}
                                            <br />
                                            <span className="text-sm text-gray-500">
                                                {booking.station_address || ""}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            {booking.service_name}
                                        </td>

                                        <td className="p-3">
                                            ₹{booking.price}
                                        </td>

                                        <td className="p-3">
                                            {new Date(
                                                booking.booking_date
                                            ).toLocaleDateString("en-IN")}
                                        </td>

                                        <td className="p-3">
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                                {booking.status}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            {booking.status === "pending" ||
                                            booking.status === "confirmed" ? (
                                                <div className="space-y-2">
                                                    {editingBooking ===
                                                    booking.id ? (
                                                        <>
                                                            <input
    type="date"
    min={getTodayDate()}
    value={editingDate}
    onChange={(event) =>
        setEditingDate(event.target.value)
    }
    className="rounded border p-2"
/>

                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateBooking(
                                                                        booking.id
                                                                    )
                                                                }
                                                                className="block rounded bg-green-600 px-3 py-2 text-white"
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setEditingBooking(
                                                                        null
                                                                    );
                                                                    setEditingDate(
                                                                        ""
                                                                    );
                                                                }}
                                                                className="rounded bg-gray-500 px-3 py-2 text-white"
                                                            >
                                                                Cancel Edit
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingBooking(
                                                                        booking.id
                                                                    );
                                                                    setEditingDate(
                                                                        booking.booking_date?.split(
                                                                            "T"
                                                                        )[0] ||
                                                                            ""
                                                                    );
                                                                }}
                                                                className="rounded bg-yellow-500 px-3 py-2 text-white"
                                                            >
                                                                Edit Date
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleCancelBooking(
                                                                        booking.id
                                                                    )
                                                                }
                                                                className="ml-2 rounded bg-red-600 px-3 py-2 text-white"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">
                                                    No actions available
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3">
                                            {booking.status === "completed" ? (
                                                <button
                                                    onClick={() =>
                                                        fetchReceipt(
                                                            booking.id
                                                        )
                                                    }
                                                    className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                                                >
                                                    View Receipt
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-500">
                                                    Available after completion
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3">
                                            <button
                                                onClick={() =>
                                                    fetchBookingHistory(
                                                        booking.id
                                                    )
                                                }
                                                className="rounded bg-purple-600 px-3 py-2 text-white hover:bg-purple-700"
                                            >
                                                View History
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {receiptLoading && (
                    <p className="mt-6 text-gray-600">
                        Loading receipt...
                    </p>
                )}

                {receipt && (
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Receipt Details
                        </h2>

                        <div className="mt-4 space-y-2 text-gray-700">
                            <p>
                                <strong>Receipt ID:</strong> {receipt.id}
                            </p>

                            <p>
                                <strong>Booking ID:</strong>{" "}
                                {receipt.bookingId}
                            </p>

                            <p>
                                <strong>Amount:</strong> ₹{receipt.amount}
                            </p>

                            <p>
                                <strong>Payment Status:</strong>{" "}
                                {receipt.paymentStatus}
                            </p>

                            <p>
                                <strong>Payment Method:</strong>{" "}
                                {receipt.paymentMethod || "Not specified"}
                            </p>

                            <p>
                                <strong>Issued At:</strong>{" "}
                                {new Date(
                                    receipt.issuedAt
                                ).toLocaleString("en-IN")}
                            </p>
                        </div>

                        <button
                            onClick={() => setReceipt(null)}
                            className="mt-5 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Close Receipt
                        </button>
                    </div>
                )}

                {/* BOOKING HISTORY SECTION */}
                {selectedBookingId && (
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Booking History — #{selectedBookingId}
                        </h2>

                        {historyLoading ? (
                            <p className="mt-4 text-gray-600">
                                Loading booking history...
                            </p>
                        ) : history.length === 0 ? (
                            <p className="mt-4 text-gray-600">
                                No status history available for this booking.
                            </p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-md border-l-4 border-purple-600 bg-gray-50 p-4"
                                    >
                                        <p className="text-gray-700">
                                            <strong>Status:</strong>{" "}
                                            {item.status}
                                        </p>

                                        <p className="text-gray-700">
                                            <strong>Changed by:</strong>{" "}
                                            {item.changedByName || "Unknown"}
                                        </p>

                                        <p className="text-gray-700">
                                            <strong>Notes:</strong>{" "}
                                            {item.notes || "No notes"}
                                        </p>

                                        <p className="text-gray-700">
                                            <strong>Date:</strong>{" "}
                                            {new Date(
                                                item.createdAt
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setSelectedBookingId(null);
                                setHistory([]);
                            }}
                            className="mt-5 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Close History
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}