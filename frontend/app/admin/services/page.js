"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

const initialForm = {
    name: "",
    description: "",
    price: "",
};

export default function AdminServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState(initialForm);
    const [editingService, setEditingService] = useState(null);

    const [error, setError] = useState("");

    const getToken = () => localStorage.getItem("token");

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    });

    // Fetch services
    const fetchServices = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/services`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to fetch services"
                );
            }

            const serviceList = Array.isArray(data)
                ? data
                : data.services || data.data || [];

            setServices(serviceList);
        } catch (err) {
            console.error("Error fetching services:", err);
            setError(err.message || "Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // Handle form changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Clear form
    const clearForm = () => {
        setForm({ ...initialForm });
        setEditingService(null);
        setError("");
    };

    // Validate form
    const validateForm = () => {
        if (!form.name.trim()) {
            alert("Service name is required.");
            return false;
        }

        if (
            form.price === "" ||
            Number.isNaN(Number(form.price)) ||
            Number(form.price) <= 0
        ) {
            alert("Please enter a valid price greater than zero.");
            return false;
        }

        return true;
    };

    // Add or update service
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const isEditing = editingService !== null;

            const url = isEditing
                ? `${API_URL}/api/admin/services/${editingService.id}`
                : `${API_URL}/api/admin/services`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    price: Number(form.price),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to save service"
                );
            }

            alert(
                isEditing
                    ? "Service updated successfully."
                    : "Service added successfully."
            );

            clearForm();
            await fetchServices();
        } catch (err) {
            console.error("Error saving service:", err);
            alert(err.message || "Unable to connect to server");
        } finally {
            setSaving(false);
        }
    };

    // Start editing
    const handleEdit = (service) => {
        setEditingService(service);

        setForm({
            name: service.name || "",
            description: service.description || "",
            price: service.price ?? service.basePrice ?? "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Delete service
    const handleDelete = async (serviceId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this service?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/admin/services/${serviceId}`,
                {
                    method: "DELETE",
                    headers: getHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to delete service. It may be used in existing bookings."
                );
            }

            alert("Service deleted successfully.");

            await fetchServices();
        } catch (err) {
            console.error("Error deleting service:", err);

            alert(
                err.message ||
                    "Unable to delete service. It may be linked to existing bookings."
            );
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Manage Services
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Add, update and manage available car services.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Add/Edit Service Form */}
                <section className="mb-8 rounded-xl bg-white p-6 shadow">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {editingService
                                ? "Edit Service"
                                : "Add New Service"}
                        </h2>

                        {editingService && (
                            <button
                                type="button"
                                onClick={clearForm}
                                className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid gap-4"
                    >
                        {/* Service Name */}
                        <div>
                            <label className="block font-medium text-gray-700">
                                Service Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter service name"
                                className="mt-2 w-full rounded-md border border-gray-300 p-3 text-gray-800"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block font-medium text-gray-700">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Enter service description"
                                rows="3"
                                className="mt-2 w-full rounded-md border border-gray-300 p-3 text-gray-800"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block font-medium text-gray-700">
                                Service Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="Enter service price"
                                min="1"
                                step="0.01"
                                className="mt-2 w-full rounded-md border border-gray-300 p-3 text-gray-800"
                                required
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 rounded-md bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingService
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
                </section>

                {/* Services Table */}
                <section className="rounded-xl bg-white p-6 shadow">
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
                            <table className="w-full min-w-[850px] border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left">
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
                                            Status
                                        </th>

                                        <th className="p-3 text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {services.map((service) => {
                                        const servicePrice =
                                            service.price ??
                                            service.basePrice ??
                                            0;

                                        const isActive =
                                            service.isActive === undefined
                                                ? true
                                                : Boolean(service.isActive);

                                        return (
                                            <tr
                                                key={service.id}
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="p-3 text-gray-700">
                                                    {service.id}
                                                </td>

                                                <td className="p-3 font-medium text-gray-800">
                                                    {service.name}
                                                </td>

                                                <td className="p-3 text-gray-600">
                                                    {service.description ||
                                                        "N/A"}
                                                </td>

                                                <td className="p-3 text-gray-800">
                                                    ₹{servicePrice}
                                                </td>

                                                <td className="p-3">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-sm ${
                                                            isActive
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    service
                                                                )
                                                            }
                                                            className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}