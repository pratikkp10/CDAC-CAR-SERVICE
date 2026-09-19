"use client";

import { useEffect, useState } from "react";

export default function ServicesPage() {
    const [stations, setStations] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedStation, setSelectedStation] = useState("");
    const [loadingStations, setLoadingStations] = useState(true);
    const [loadingServices, setLoadingServices] = useState(false);
    const [error, setError] = useState("");

    // Fetch all active service stations
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/stations"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch stations");
                }

                const data = await response.json();

                const stationList = data.stations || [];
                setStations(stationList);

                if (stationList.length > 0) {
                    setSelectedStation(String(stationList[0].id));
                }
            } catch (error) {
                console.error("Error fetching stations:", error);
                setError("Unable to load service stations.");
            } finally {
                setLoadingStations(false);
            }
        };

        fetchStations();
    }, []);

    // Fetch services for the selected station
    useEffect(() => {
        const fetchStationServices = async () => {
            if (!selectedStation) {
                setServices([]);
                return;
            }

            setLoadingServices(true);
            setError("");

            try {
                const response = await fetch(
                    `http://localhost:5000/api/services/station/${selectedStation}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch station services");
                }

                const data = await response.json();
                setServices(data.services || []);
            } catch (error) {
                console.error("Error fetching station services:", error);
                setError("Unable to load services for this station.");
                setServices([]);
            } finally {
                setLoadingServices(false);
            }
        };

        fetchStationServices();
    }, [selectedStation]);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-6xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    Available Services
                </h1>

                <p className="mt-2 text-gray-600">
                    Choose a service station and the service your car needs.
                </p>

                {/* Station selection */}
                <div className="mt-6 rounded-lg bg-white p-6 shadow">
                    <label
                        htmlFor="station"
                        className="block text-lg font-semibold text-gray-800"
                    >
                        Select Service Station
                    </label>

                    {loadingStations ? (
                        <p className="mt-3 text-gray-600">
                            Loading stations...
                        </p>
                    ) : stations.length === 0 ? (
                        <p className="mt-3 text-red-600">
                            No service stations available.
                        </p>
                    ) : (
                        <select
                            id="station"
                            value={selectedStation}
                            onChange={(event) =>
                                setSelectedStation(event.target.value)
                            }
                            className="mt-3 w-full rounded-md border border-gray-300 bg-white p-3 text-gray-700"
                        >
                            <option value="">
                                Choose a service station
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
                    )}
                </div>

                {error && (
                    <p className="mt-6 rounded-md bg-red-100 p-4 text-red-700">
                        {error}
                    </p>
                )}

                {/* Services list */}
                {loadingServices ? (
                    <p className="mt-8 text-gray-600">
                        Loading services...
                    </p>
                ) : selectedStation && services.length === 0 ? (
                    <p className="mt-8 text-gray-600">
                        No services are available at this station.
                    </p>
                ) : (
                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="rounded-lg bg-white p-6 shadow"
                            >
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {service.name}
                                </h2>

                                <p className="mt-3 text-gray-600">
                                    {service.description}
                                </p>

                                <p className="mt-4 text-lg font-bold text-blue-600">
                                    ₹{service.stationPrice}
                                </p>

                                <a
                                    href={`/dashboard/bookings?serviceId=${service.id}&stationId=${selectedStation}`}
                                    className="mt-4 block w-full rounded-md bg-blue-600 py-2 text-center text-white hover:bg-blue-700"
                                >
                                    Book Service
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}