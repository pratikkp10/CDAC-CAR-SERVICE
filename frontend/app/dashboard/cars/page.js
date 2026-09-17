"use client";

import { useEffect, useState } from "react";

export default function CarsPage() {
    const [cars, setCars] = useState([]);

    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [year, setYear] = useState("");

    const [editingCar, setEditingCar] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCars = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/cars",
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

            setCars(data.cars);

        } catch (error) {
            console.error("Error fetching cars:", error);
            alert("Unable to connect to server");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const clearForm = () => {
        setBrand("");
        setModel("");
        setRegistrationNumber("");
        setYear("");
        setEditingCar(null);
    };

    const handleAddCar = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/cars",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        brand,
                        model,
                        registration_number: registrationNumber,
                        year
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Car added successfully!");

            clearForm();
            fetchCars();

        } catch (error) {
            console.error("Error adding car:", error);
            alert("Unable to connect to server");
        }
    };

    const handleEditClick = (car) => {
        setEditingCar(car);

        setBrand(car.brand);
        setModel(car.model);
        setRegistrationNumber(car.registration_number);
        setYear(car.year);
    };

    const handleUpdateCar = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/cars/${editingCar.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        brand,
                        model,
                        registration_number: registrationNumber,
                        year
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Car updated successfully!");

            clearForm();
            fetchCars();

        } catch (error) {
            console.error("Error updating car:", error);
            alert("Unable to connect to server");
        }
    };

    const handleDeleteCar = async (carId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this car?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/cars/${carId}`,
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

            alert("Car deleted successfully!");

            fetchCars();

        } catch (error) {
            console.error("Error deleting car:", error);
            alert("Unable to connect to server");
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">

            <div className="mx-auto max-w-6xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    My Cars
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage your registered cars.
                </p>

                {/* Add / Edit Car Form */}

                <div className="mt-8 rounded-lg bg-white p-6 shadow">

                    <h2 className="text-2xl font-semibold text-gray-800">
                        {editingCar ? "Edit Car" : "Add a Car"}
                    </h2>

                    <form
                        onSubmit={
                            editingCar
                                ? handleUpdateCar
                                : handleAddCar
                        }
                        className="mt-6 grid gap-4 md:grid-cols-2"
                    >

                        <input
                            type="text"
                            placeholder="Car Brand"
                            value={brand}
                            onChange={(e) =>
                                setBrand(e.target.value)
                            }
                            className="rounded-md border border-gray-300 p-3"
                            required
                        />

                        <input
                            type="text"
                            placeholder="Car Model"
                            value={model}
                            onChange={(e) =>
                                setModel(e.target.value)
                            }
                            className="rounded-md border border-gray-300 p-3"
                            required
                        />

                        <input
                            type="text"
                            placeholder="Registration Number"
                            value={registrationNumber}
                            onChange={(e) =>
                                setRegistrationNumber(e.target.value)
                            }
                            className="rounded-md border border-gray-300 p-3"
                            required
                        />

                        <input
                            type="number"
                            placeholder="Year"
                            value={year}
                            onChange={(e) =>
                                setYear(e.target.value)
                            }
                            className="rounded-md border border-gray-300 p-3"
                        />

                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 py-3 text-white hover:bg-blue-700 md:col-span-2"
                        >
                            {editingCar
                                ? "Update Car"
                                : "Add Car"}
                        </button>

                        {editingCar && (
                            <button
                                type="button"
                                onClick={clearForm}
                                className="rounded-md border border-gray-400 py-3 text-gray-700 hover:bg-gray-100 md:col-span-2"
                            >
                                Cancel Edit
                            </button>
                        )}

                    </form>

                </div>

                {/* Registered Cars */}

                <h2 className="mt-10 text-2xl font-semibold text-gray-800">
                    My Registered Cars
                </h2>

                {loading ? (
                    <p className="mt-4 text-gray-600">
                        Loading cars...
                    </p>

                ) : cars.length === 0 ? (
                    <p className="mt-4 text-gray-600">
                        You have not added any cars yet.
                    </p>

                ) : (
                    <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {cars.map((car) => (

                            <div
                                key={car.id}
                                className="rounded-lg bg-white p-6 shadow"
                            >

                                <h3 className="text-xl font-semibold text-gray-800">
                                    {car.brand} {car.model}
                                </h3>

                                <p className="mt-3 text-gray-600">
                                    Registration:{" "}
                                    {car.registration_number}
                                </p>

                                <p className="mt-2 text-gray-600">
                                    Year: {car.year}
                                </p>

                                <div className="mt-5 flex gap-3">

                                    <button
                                        onClick={() =>
                                            handleEditClick(car)
                                        }
                                        className="flex-1 rounded-md bg-yellow-500 py-2 text-white hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDeleteCar(car.id)
                                        }
                                        className="flex-1 rounded-md bg-red-600 py-2 text-white hover:bg-red-700"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </main>
    );
}