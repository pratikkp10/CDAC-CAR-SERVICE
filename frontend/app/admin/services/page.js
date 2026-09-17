"use client";

import { useEffect, useState } from "react";

export default function AdminServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");

    const [editingService, setEditingService] = useState(null);

    const fetchServices = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/services"
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch services");
                return;
            }

            setServices(data.services || data);
        } catch (error) {
            console.error("Error fetching services:", error);
            alert("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const clearForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setEditingService(null);
    };

    const handleAddService = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/services",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name,
                        description,
                        price
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to add service");
                return;
            }

            alert("Service added successfully!");

            clearForm();
            fetchServices();

        } catch (error) {
            console.error("Error adding service:", error);
            alert("Unable to connect to server");
        }
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/admin/services/${editingService.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name,
                        description,
                        price
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update service");
                return;
            }

            alert("Service updated successfully!");

            clearForm();
            fetchServices();

        } catch (error) {
            console.error("Error updating service:", error);
            alert("Unable to connect to server");
        }
    };

    const handleDeleteService = async (serviceId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this service?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/admin/services/${serviceId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to delete service");
                return;
            }

            alert("Service deleted successfully!");

            fetchServices();

        } catch (error) {
            console.error("Error deleting service:", error);
            alert("Unable to connect to server");
        }
    };

    const startEditing = (service) => {
        setEditingService(service);
        setName(service.name);
        setDescription(service.description || "");
        setPrice(service.price);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">

                <h1 className="text-3xl font-bold text-gray-800">
                    Manage Services
                </h1>

                <p className="mt-2 text-gray-600">
                    Add, edit, and manage available car services.
                </p>

                <div className="mt-8 rounded-xl bg-white p-6 shadow">

                    <h2 className="text-xl font-semibold text-gray-800">
                        {editingService
                            ? "Edit Service"
                            : "Add New Service"}
                    </h2>

                    <form
                        onSubmit={
                            editingService
                                ? handleUpdateService
                                : handleAddService
                        }
                        className="mt-5 grid gap-4"
                    >

                        <div>
                            <label className="block text-gray-700">
                                Service Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter service name"
                                className="mt-2 w-full rounded-md border border-gray-300 p-3 text-gray-800"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Enter service description"
                                rows="3"
                                className="mt-2 w-full rounded-md border border-gray-300 p-3 text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Price
                            </label>

                            <input
                                type="number"
                                value={price}
                                onChange={(e) =>
                                    setPrice(e.target.value)
                                }
                                placeholder="Enter price"
                                min="1"
                                className="mt-2 w-full rounded-md border border-gray-300 p-3 text-gray-800"
                                required
                            />
                        </div>

                        <div className="flex gap-3">

                            <button
                                type="submit"
                                className="flex-1 rounded-md bg-blue-600 py-3 text-white hover:bg-blue-700"
                            >
                                {editingService
                                    ? "Update Service"
                                    : "Add Service"}
                            </button>

                            {editingService && (
                                <button
                                    type="button"
                                    onClick={clearForm}
                                    className="flex-1 rounded-md border border-gray-400 py-3 text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>

                </div>

                <div className="mt-8 rounded-xl bg-white p-6 shadow">

                    <h2 className="text-xl font-semibold text-gray-800">
                        Existing Services
                    </h2>

                    {loading ? (
                        <p className="mt-5 text-gray-600">
                            Loading services...
                        </p>
                    ) : services.length === 0 ? (
                        <p className="mt-5 text-gray-600">
                            No services found.
                        </p>
                    ) : (
                        <div className="mt-5 overflow-x-auto">

                            <table className="w-full min-w-[800px] border-collapse">

                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="p-3 text-gray-700">
                                            ID
                                        </th>

                                        <th className="p-3 text-gray-700">
                                            Name
                                        </th>

                                        <th className="p-3 text-gray-700">
                                            Description
                                        </th>

                                        <th className="p-3 text-gray-700">
                                            Price
                                        </th>

                                        <th className="p-3 text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {services.map((service) => (
                                        <tr
                                            key={service.id}
                                            className="border-b last:border-b-0"
                                        >
                                            <td className="p-3 text-gray-600">
                                                {service.id}
                                            </td>

                                            <td className="p-3 font-medium text-gray-800">
                                                {service.name}
                                            </td>

                                            <td className="p-3 text-gray-600">
                                                {service.description}
                                            </td>

                                            <td className="p-3 text-gray-800">
                                                ₹{service.price}
                                            </td>

                                            <td className="p-3">
                                                <div className="flex gap-2">

                                                    <button
                                                        onClick={() =>
                                                            startEditing(
                                                                service
                                                            )
                                                        }
                                                        className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDeleteService(
                                                                service.id
                                                            )
                                                        }
                                                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>
        </main>
    );
}