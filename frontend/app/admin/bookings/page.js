"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000";

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [receipt, setReceipt] = useState(null);
    const [receiptLoading, setReceiptLoading] = useState(false);

    const [paymentStatus, setPaymentStatus] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentUpdating, setPaymentUpdating] = useState(false);

    const getToken = () => {
        if (typeof window === "undefined") {
            return "";
        }

        return localStorage.getItem("token");
    };

    const getHeaders = () => ({
        Authorization: `Bearer ${getToken()}`
    });

    /*
     * Important:
     * Do not use new Date() for MySQL DATE values.
     * It can convert the date into UTC and display the wrong date.
     */
    const formatBookingDate = (dateValue) => {
        if (!dateValue) {
            return "Not available";
        }

        const dateString = String(dateValue).split("T")[0];
        const parts = dateString.split("-");

        if (parts.length === 3) {
            const [year, month, day] = parts;

            return `${day}/${month}/${year}`;
        }

        return dateString;
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) {
            return "Not available";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleString("en-IN");
    };

    const getBookingId = (booking) => {
        return booking.id ?? booking.bookingId;
    };

    const getCustomerName = (booking) => {
        return (
            booking.customer_name ||
            booking.customerName ||
            booking.name ||
            "Not available"
        );
    };

    const getCustomerEmail = (booking) => {
        return booking.email || booking.customerEmail || "Not available";
    };

    const getCarName = (booking) => {
        const brand = booking.brand || booking.carBrand || "";
        const model = booking.model || booking.carModel || "";

        return `${brand} ${model}`.trim() || "Not available";
    };

    const getRegistrationNumber = (booking) => {
        return (
            booking.registration_number ||
            booking.registrationNumber ||
            "Not available"
        );
    };

    const getServiceName = (booking) => {
        return (
            booking.service_name ||
            booking.serviceName ||
            booking.name ||
            "Not available"
        );
    };

    const getStationName = (booking) => {
        return (
            booking.station_name ||
            booking.stationName ||
            "Not assigned"
        );
    };

    const getBookingPrice = (booking) => {
        return (
            booking.price ??
            booking.servicePrice ??
            booking.amount ??
            0
        );
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            case "in_progress":
                return "bg-blue-100 text-blue-700";

            case "confirmed":
                return "bg-purple-100 text-purple-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/admin/bookings`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to fetch bookings"
                );
            }

            setBookings(data.bookings || data || []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setError(error.message || "Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId, status) => {
        try {
            const response = await fetch(
                `${API_URL}/api/admin/bookings/${bookingId}/status`,
                {
                    method: "PUT",
                    headers: {
                        ...getHeaders(),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                        "Unable to update booking status"
                );
                return;
            }

            alert("Booking status updated successfully!");

            await fetchBookings();

            if (selectedBooking) {
                await fetchBookingHistory(bookingId);
            }
        } catch (error) {
            console.error("Error updating booking status:", error);
            alert("Unable to connect to server");
        }
    };

    const fetchBookingHistory = async (bookingId) => {
        try {
            setHistoryLoading(true);
            setHistory([]);
            setSelectedBooking(bookingId);

            /*
             * The first endpoint is the expected endpoint.
             * Fallback endpoints are included for compatibility.
             */
            const endpoints = [
                `${API_URL}/api/booking-history/${bookingId}`,
                `${API_URL}/api/admin/bookings/${bookingId}/history`,
                `${API_URL}/api/bookings/${bookingId}/history`
            ];

            let successfulResponse = null;

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        headers: getHeaders()
                    });

                    if (response.ok) {
                        successfulResponse = response;
                        break;
                    }
                } catch (error) {
                    console.error(
                        `History endpoint failed: ${endpoint}`,
                        error
                    );
                }
            }

            if (!successfulResponse) {
                alert("Unable to fetch booking history");
                return;
            }

            const data = await successfulResponse.json();

            setHistory(
                data.history ||
                    data.bookingHistory ||
                    data.data ||
                    data ||
                    []
            );
        } catch (error) {
            console.error("Error fetching booking history:", error);
            alert("Unable to fetch booking history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchReceipt = async (bookingId) => {
        try {
            setReceiptLoading(true);
            setReceipt(null);

            const response = await fetch(
                `${API_URL}/api/receipts/booking/${bookingId}`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Receipt not found");
                return;
            }

            const receivedReceipt = data.receipt || data;

            setReceipt(receivedReceipt);
            setPaymentStatus(
                receivedReceipt.paymentStatus ||
                    receivedReceipt.payment_status ||
                    "pending"
            );
            setPaymentMethod(
                receivedReceipt.paymentMethod ||
                    receivedReceipt.payment_method ||
                    ""
            );
        } catch (error) {
            console.error("Error fetching receipt:", error);
            alert("Unable to fetch receipt");
        } finally {
            setReceiptLoading(false);
        }
    };

    const updatePaymentStatus = async () => {
        if (!receipt) {
            alert("Receipt information is unavailable");
            return;
        }

        const receiptId = receipt.id;

        if (!receiptId) {
            alert("Receipt ID is unavailable");
            return;
        }

        try {
            setPaymentUpdating(true);

            const response = await fetch(
                `${API_URL}/api/receipts/${receiptId}/payment-status`,
                {
                    method: "PATCH",
                    headers: {
                        ...getHeaders(),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        paymentStatus,
                        paymentMethod
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                        "Unable to update payment status"
                );
                return;
            }

            alert("Payment status updated successfully!");

            setReceipt((previousReceipt) => ({
                ...previousReceipt,
                paymentStatus,
                paymentMethod
            }));
        } catch (error) {
            console.error(
                "Error updating payment status:",
                error
            );

            alert("Unable to connect to server");
        } finally {
            setPaymentUpdating(false);
        }
    };

    const closeHistory = () => {
        setSelectedBooking(null);
        setHistory([]);
    };

    const closeReceipt = () => {
        setReceipt(null);
        setPaymentStatus("");
        setPaymentMethod("");
    };

    const filteredBookings = useMemo(() => {
        const search = searchText.trim().toLowerCase();

        return bookings.filter((booking) => {
            const bookingId = String(getBookingId(booking) || "");
            const customerName = getCustomerName(booking).toLowerCase();
            const customerEmail = getCustomerEmail(booking).toLowerCase();
            const carName = getCarName(booking).toLowerCase();
            const registration = getRegistrationNumber(
                booking
            ).toLowerCase();

            const status = String(
                booking.status || ""
            ).toLowerCase();

            const matchesSearch =
                !search ||
                bookingId.includes(search) ||
                customerName.includes(search) ||
                customerEmail.includes(search) ||
                carName.includes(search) ||
                registration.includes(search);

            const matchesStatus =
                statusFilter === "all" ||
                status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchText, statusFilter]);

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Manage Bookings
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View and manage all customer bookings.
                        </p>
                    </div>

                    <button
                        onClick={fetchBookings}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Refresh Bookings
                    </button>
                </div>

                <div className="mb-6 grid gap-4 rounded-xl bg-white p-5 shadow md:grid-cols-2">
                    <div>
                        <label className="mb-2 block font-medium text-gray-700">
                            Search bookings
                        </label>

                        <input
                            type="text"
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(event.target.value)
                            }
                            placeholder="Search by ID, customer, email, car..."
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium text-gray-700">
                            Filter by status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-800"
                        >
                            <option value="all">All bookings</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">
                                In Progress
                            </option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
                    {loading ? (
                        <p className="text-gray-600">
                            Loading bookings...
                        </p>
                    ) : error ? (
                        <div>
                            <p className="text-red-600">{error}</p>

                            <button
                                onClick={fetchBookings}
                                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <p className="text-gray-600">
                            No bookings found.
                        </p>
                    ) : (
                        <table className="w-full min-w-[1500px] border-collapse">
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
                                        Station
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Date
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Price
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Booking Status
                                    </th>

                                    <th className="p-3 text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBookings.map((booking) => {
                                    const bookingId =
                                        getBookingId(booking);

                                    const status =
                                        booking.status || "pending";

                                    return (
                                        <tr
                                            key={bookingId}
                                            className="border-b last:border-b-0"
                                        >
                                            <td className="p-3 text-gray-700">
                                                #{bookingId}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                {getCustomerName(booking)}
                                            </td>

                                            <td className="p-3 text-gray-600">
                                                {getCustomerEmail(booking)}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                {getCarName(booking)}
                                            </td>

                                            <td className="p-3 text-gray-600">
                                                {getRegistrationNumber(
                                                    booking
                                                )}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                {getServiceName(booking)}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                {getStationName(booking)}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                {formatBookingDate(
                                                    booking.booking_date ||
                                                        booking.bookingDate
                                                )}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                ₹{getBookingPrice(booking)}
                                            </td>

                                            <td className="p-3">
                                                <select
                                                    value={status}
                                                    onChange={(event) =>
                                                        updateBookingStatus(
                                                            bookingId,
                                                            event.target.value
                                                        )
                                                    }
                                                    className={`rounded-lg border border-gray-300 p-2 ${getStatusClass(
                                                        status
                                                    )}`}
                                                >
                                                    <option value="pending">
                                                        pending
                                                    </option>

                                                    <option value="confirmed">
                                                        confirmed
                                                    </option>

                                                    <option value="in_progress">
                                                        in_progress
                                                    </option>

                                                    <option value="completed">
                                                        completed
                                                    </option>

                                                    <option value="cancelled">
                                                        cancelled
                                                    </option>
                                                </select>
                                            </td>

                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() =>
                                                            fetchBookingHistory(
                                                                bookingId
                                                            )
                                                        }
                                                        className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                                                    >
                                                        History
                                                    </button>

                                                    {status ===
                                                        "completed" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    fetchReceipt(
                                                                        bookingId
                                                                    )
                                                                }
                                                                className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                                                            >
                                                                Receipt
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    fetchReceipt(
                                                                        bookingId
                                                                    )
                                                                }
                                                                className="rounded bg-purple-600 px-3 py-2 text-white hover:bg-purple-700"
                                                            >
                                                                Payment
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {selectedBooking !== null && (
                    <div className="mt-8 rounded-xl bg-white p-6 shadow">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Booking History
                            </h2>

                            <button
                                onClick={closeHistory}
                                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>

                        {historyLoading ? (
                            <p className="text-gray-600">
                                Loading booking history...
                            </p>
                        ) : history.length === 0 ? (
                            <p className="text-gray-600">
                                No booking history found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className="rounded-lg border border-gray-300 p-4"
                                    >
                                        <p className="text-gray-700">
                                            <strong>Status:</strong>{" "}
                                            {item.status || "Not available"}
                                        </p>

                                        <p className="mt-2 text-gray-700">
                                            <strong>Changed by:</strong>{" "}
                                            {item.changedByName ||
                                                item.changed_by_name ||
                                                item.changedBy ||
                                                item.changed_by ||
                                                "Not available"}
                                        </p>

                                        <p className="mt-2 text-gray-700">
                                            <strong>Date:</strong>{" "}
                                            {formatDateTime(
                                                item.createdAt ||
                                                    item.created_at
                                            )}
                                        </p>

                                        <p className="mt-2 text-gray-700">
                                            <strong>Notes:</strong>{" "}
                                            {item.notes || "N/A"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {receiptLoading && (
                    <div className="mt-8 rounded-xl bg-white p-6 shadow">
                        <p className="text-gray-600">
                            Loading receipt details...
                        </p>
                    </div>
                )}

                {receipt && !receiptLoading && (
                    <div className="mt-8 rounded-xl bg-white p-6 shadow">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Receipt and Payment Details
                            </h2>

                            <button
                                onClick={closeReceipt}
                                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-3 text-gray-700">
                            <p>
                                <strong>Receipt ID:</strong>{" "}
                                {receipt.id || "Not available"}
                            </p>

                            <p>
                                <strong>Booking ID:</strong>{" "}
                                {receipt.bookingId ||
                                    receipt.booking_id ||
                                    "Not available"}
                            </p>

                            <p>
                                <strong>Amount:</strong> ₹
                                {receipt.amount || 0}
                            </p>

                            <p>
                                <strong>Issued At:</strong>{" "}
                                {formatDateTime(
                                    receipt.issuedAt ||
                                        receipt.issued_at
                                )}
                            </p>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
                                    Payment Status
                                </label>

                                <select
                                    value={paymentStatus}
                                    onChange={(event) =>
                                        setPaymentStatus(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-800"
                                >
                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="paid">Paid</option>

                                    <option value="failed">
                                        Failed
                                    </option>

                                    <option value="refunded">
                                        Refunded
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
                                    Payment Method
                                </label>

                                <select
                                    value={paymentMethod}
                                    onChange={(event) =>
                                        setPaymentMethod(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-800"
                                >
                                    <option value="">
                                        Select payment method
                                    </option>

                                    <option value="cash">Cash</option>

                                    <option value="upi">UPI</option>

                                    <option value="card">Card</option>

                                    <option value="net_banking">
                                        Net Banking
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={updatePaymentStatus}
                            disabled={paymentUpdating}
                            className="mt-5 rounded bg-purple-600 px-5 py-3 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {paymentUpdating
                                ? "Updating..."
                                : "Update Payment"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}