"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:5000";

const emptyStation = {
    name: "",
    address: "",
    phone: "",
    email: "",
    operatingHours: "",
};

export default function StationManagementPage() {
    const [stations, setStations] = useState([]);
    const [services, setServices] = useState([]);

    const [stationForm, setStationForm] = useState(emptyStation);
    const [editingStationId, setEditingStationId] = useState(null);

    const [selectedStation, setSelectedStation] = useState(null);
    const [stationPrices, setStationPrices] = useState({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [priceSaving, setPriceSaving] = useState(false);
    const [error, setError] = useState("");

    const pricingSectionRef = useRef(null);

    const getToken = () => localStorage.getItem("token");

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    });

    const fetchStations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/stations`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to fetch stations");
            }

            const stationList = Array.isArray(data)
                ? data
                : data.stations || data.data || [];

            setStations(stationList);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch(`${API_URL}/api/services`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to fetch services");
            }

            const serviceList = Array.isArray(data)
                ? data
                : data.services || data.data || [];

            setServices(serviceList);
        } catch (err) {
            setError(err.message);
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError("");

        await Promise.all([fetchStations(), fetchServices()]);

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setStationForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setStationForm({ ...emptyStation });
        setEditingStationId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !stationForm.name.trim() ||
            !stationForm.address.trim()
        ) {
            alert("Station name and address are required.");
            return;
        }

        setSaving(true);

        try {
            const isEditing = editingStationId !== null;

            const url = isEditing
                ? `${API_URL}/api/stations/${editingStationId}`
                : `${API_URL}/api/stations`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: getHeaders(),
                body: JSON.stringify(stationForm),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to save station"
                );
            }

            alert(
                isEditing
                    ? "Station updated successfully."
                    : "Station added successfully."
            );

            resetForm();
            await fetchStations();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (station) => {
        setEditingStationId(station.id);

        setStationForm({
            name: station.name || "",
            address: station.address || "",
            phone: station.phone || "",
            email: station.email || "",
            operatingHours: station.operatingHours || "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDeactivate = async (stationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this station?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/stations/${stationId}/deactivate`,
                {
                    method: "PATCH",
                    headers: getHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to deactivate station"
                );
            }

            alert("Station deactivated successfully.");

            if (selectedStation?.id === stationId) {
                setSelectedStation(null);
                setStationPrices({});
            }

            await fetchStations();
        } catch (err) {
            alert(err.message);
        }
    };

    // Select station, load prices and scroll to the pricing section
    const handleSelectStation = async (station) => {
        setSelectedStation(station);
        setStationPrices({});
        setError("");

        // Scroll to the pricing section after it appears
        setTimeout(() => {
            pricingSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);

        try {
            const response = await fetch(
                `${API_URL}/api/station-service-prices/${station.id}`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to fetch station prices"
                );
            }

            const prices = Array.isArray(data)
                ? data
                : data.prices || data.data || [];

            const priceMap = {};

            if (Array.isArray(prices)) {
                prices.forEach((item) => {
                    const serviceId =
                        item.serviceId ??
                        item.service_id ??
                        item.serviceID;

                    const price =
                        item.price ??
                        item.stationPrice ??
                        item.station_price;

                    if (
                        serviceId !== undefined &&
                        price !== undefined
                    ) {
                        priceMap[String(serviceId)] = price;
                    }
                });
            }

            setStationPrices(priceMap);
        } catch (err) {
            console.error("Station price loading error:", err);

            // Keep the pricing section visible even if loading prices fails
            alert(err.message);
        }
    };

    const handlePriceChange = (serviceId, price) => {
        setStationPrices((previous) => ({
            ...previous,
            [String(serviceId)]: price,
        }));
    };

    const handleSavePrice = async (service) => {
        if (!selectedStation) {
            alert("Please select a station first.");
            return;
        }

        const price = stationPrices[String(service.id)];

        if (
            price === undefined ||
            price === "" ||
            Number.isNaN(Number(price)) ||
            Number(price) < 0
        ) {
            alert("Please enter a valid price.");
            return;
        }

        setPriceSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/api/station-service-prices`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        stationId: selectedStation.id,
                        serviceId: service.id,
                        price: Number(price),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to save service price"
                );
            }

            alert("Station service price saved successfully.");

            await handleSelectStation(selectedStation);
        } catch (err) {
            alert(err.message);
        } finally {
            setPriceSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <p className="text-gray-700">
                    Loading station management...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Station Management
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Add, update, deactivate and manage service stations.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Add/Edit Station Form */}
                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {editingStationId
                                ? "Edit Station"
                                : "Add New Station"}
                        </h2>

                        {editingStationId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <input
                            name="name"
                            value={stationForm.name}
                            onChange={handleFormChange}
                            placeholder="Station name"
                            className="rounded-md border p-3 text-gray-800"
                            required
                        />

                        <input
                            name="phone"
                            value={stationForm.phone}
                            onChange={handleFormChange}
                            placeholder="Phone number"
                            className="rounded-md border p-3 text-gray-800"
                        />

                        <input
                            name="email"
                            type="email"
                            value={stationForm.email}
                            onChange={handleFormChange}
                            placeholder="Email address"
                            className="rounded-md border p-3 text-gray-800"
                        />

                        <input
                            name="operatingHours"
                            value={stationForm.operatingHours}
                            onChange={handleFormChange}
                            placeholder="Operating hours, e.g. 9 AM - 7 PM"
                            className="rounded-md border p-3 text-gray-800"
                        />

                        <textarea
                            name="address"
                            value={stationForm.address}
                            onChange={handleFormChange}
                            placeholder="Station address"
                            className="rounded-md border p-3 text-gray-800 md:col-span-2"
                            rows="3"
                            required
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 md:col-span-2"
                        >
                            {saving
                                ? "Saving..."
                                : editingStationId
                                ? "Update Station"
                                : "Add Station"}
                        </button>
                    </form>
                </section>

                {/* Station List */}
                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                    <h2 className="mb-5 text-xl font-semibold text-gray-800">
                        All Service Stations
                    </h2>

                    {stations.length === 0 ? (
                        <p className="text-gray-600">
                            No stations found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left">
                                        <th className="p-3 text-gray-700">
                                            ID
                                        </th>
                                        <th className="p-3 text-gray-700">
                                            Name
                                        </th>
                                        <th className="p-3 text-gray-700">
                                            Address
                                        </th>
                                        <th className="p-3 text-gray-700">
                                            Phone
                                        </th>
                                        <th className="p-3 text-gray-700">
                                            Email
                                        </th>
                                        <th className="p-3 text-gray-700">
                                            Status
                                        </th>
                                        <th className="p-3 text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {stations.map((station) => (
                                        <tr
                                            key={station.id}
                                            className="border-b"
                                        >
                                            <td className="p-3 text-gray-800">
                                                {station.id}
                                            </td>

                                            <td className="p-3 font-medium text-gray-800">
                                                {station.name}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                {station.address}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                {station.phone || "N/A"}
                                            </td>

                                            <td className="p-3 text-gray-700">
                                                {station.email || "N/A"}
                                            </td>

                                            <td className="p-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm ${
                                                        station.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {station.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="space-x-2 p-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(station)
                                                    }
                                                    className="rounded-md bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectStation(
                                                            station
                                                        )
                                                    }
                                                    className="rounded-md bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700"
                                                >
                                                    Prices
                                                </button>

                                                {station.isActive && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                station.id
                                                            )
                                                        }
                                                        className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Station Pricing Section */}
                {selectedStation && (
                    <section
                        ref={pricingSectionRef}
                        className="scroll-mt-6 rounded-xl bg-white p-6 shadow"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Station Service Prices
                                </h2>

                                <p className="mt-1 text-gray-600">
                                    Station: {selectedStation.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedStation(null);
                                    setStationPrices({});
                                }}
                                className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>

                        {services.length === 0 ? (
                            <p className="text-gray-600">
                                No services available.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {services.map((service) => {
                                    const serviceId = String(service.id);

                                    const defaultPrice =
                                        service.price ??
                                        service.basePrice ??
                                        0;

                                    return (
                                        <div
                                            key={service.id}
                                            className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div>
                                                <h3 className="font-medium text-gray-800">
                                                    {service.name}
                                                </h3>

                                                <p className="text-sm text-gray-500">
                                                    Default price: ₹
                                                    {defaultPrice}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        stationPrices[
                                                            serviceId
                                                        ] ?? ""
                                                    }
                                                    onChange={(event) =>
                                                        handlePriceChange(
                                                            service.id,
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Station price"
                                                    className="w-40 rounded-md border p-2 text-gray-800"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSavePrice(service)
                                                    }
                                                    disabled={priceSaving}
                                                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-green-300"
                                                >
                                                    {priceSaving
                                                        ? "Saving..."
                                                        : "Save"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}