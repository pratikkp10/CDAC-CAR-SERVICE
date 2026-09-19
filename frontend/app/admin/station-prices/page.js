"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function StationPricesPage() {
    const [stations, setStations] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedStationId, setSelectedStationId] = useState("");
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStations();
        fetchServices();
    }, []);

    const fetchStations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/stations`);
            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch stations");
                return;
            }

            setStations(data.stations || data);
        } catch (error) {
            console.error("Error fetching stations:", error);
            alert("Unable to connect to the server");
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch(`${API_URL}/api/services`);
            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch services");
                return;
            }

            setServices(data.services || data);
        } catch (error) {
            console.error("Error fetching services:", error);
            alert("Unable to connect to the server");
        }
    };

    const fetchStationPrices = async (stationId) => {
        if (!stationId) {
            setPrices({});
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/station-service-prices/${stationId}`
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch station prices");
                return;
            }

            const priceMap = {};

            const stationPrices = data.prices || data;

            stationPrices.forEach((item) => {
                priceMap[item.serviceId] = item.price;
            });

            setPrices(priceMap);
        } catch (error) {
            console.error("Error fetching station prices:", error);
            alert("Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    const handleStationChange = (event) => {
        const stationId = event.target.value;

        setSelectedStationId(stationId);
        fetchStationPrices(stationId);
    };

    const handlePriceChange = (serviceId, value) => {
        setPrices((previousPrices) => ({
            ...previousPrices,
            [serviceId]: value
        }));
    };

    const savePrice = async (serviceId) => {
        if (!selectedStationId) {
            alert("Please select a station first");
            return;
        }

        const price = prices[serviceId];

        if (price === undefined || price === "" || Number(price) < 0) {
            alert("Please enter a valid price");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/station-service-prices`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        stationId: Number(selectedStationId),
                        serviceId: Number(serviceId),
                        price: Number(price)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to save price");
                return;
            }

            alert("Station service price saved successfully");
            fetchStationPrices(selectedStationId);
        } catch (error) {
            console.error("Error saving station price:", error);
            alert("Unable to connect to the server");
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-800">
                    Station Service Pricing
                </h1>

                <p className="mt-2 text-gray-600">
                    Configure service prices for individual stations.
                </p>

                <section className="mt-8 rounded-xl bg-white p-6 shadow">
                    <label className="mb-2 block font-semibold text-gray-700">
                        Select Service Station
                    </label>

                    <select
                        value={selectedStationId}
                        onChange={handleStationChange}
                        className="w-full rounded-md border border-gray-300 p-3 text-gray-800 md:w-1/2"
                    >
                        <option value="">Select a station</option>

                        {stations
                            .filter(
                                (station) =>
                                    Number(station.isActive) === 1
                            )
                            .map((station) => (
                                <option
                                    key={station.id}
                                    value={station.id}
                                >
                                    {station.name}
                                </option>
                            ))}
                    </select>
                </section>

                {selectedStationId && (
                    <section className="mt-8 rounded-xl bg-white p-6 shadow">
                        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                            Configure Service Prices
                        </h2>

                        {loading ? (
                            <p className="text-gray-600">
                                Loading prices...
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] border-collapse">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="p-3 text-gray-700">
                                                Service
                                            </th>

                                            <th className="p-3 text-gray-700">
                                                Base Price
                                            </th>

                                            <th className="p-3 text-gray-700">
                                                Station Price
                                            </th>

                                            <th className="p-3 text-gray-700">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {services.map((service) => (
                                            <tr
                                                key={service.id}
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="p-3 font-medium text-gray-800">
                                                    {service.name}
                                                </td>

                                                <td className="p-3 text-gray-600">
                                                    ₹
                                                    {Number(
                                                        service.basePrice ??
                                                            service.price ??
                                                            0
                                                    ).toFixed(2)}
                                                </td>

                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            prices[
                                                                service.id
                                                            ] ?? ""
                                                        }
                                                        onChange={(event) =>
                                                            handlePriceChange(
                                                                service.id,
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="Enter price"
                                                        className="w-40 rounded-md border border-gray-300 p-2 text-gray-800"
                                                    />
                                                </td>

                                                <td className="p-3">
                                                    <button
                                                        onClick={() =>
                                                            savePrice(
                                                                service.id
                                                            )
                                                        }
                                                        className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                                                    >
                                                        Save Price
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}