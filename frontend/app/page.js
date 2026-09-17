export default function Home() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">
                    Car Service
                </h1>

                <p className="mt-4 text-lg text-gray-600">
                    Your Car, Our Responsibility
                </p>

                <div className="mt-6 flex gap-4 justify-center">
                    <a
                        href="/login"
                        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                    >
                        Login
                    </a>

                    <a
                        href="/register"
                        className="rounded-lg border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50"
                    >
                        Register
                    </a>
                </div>
            </div>
        </main>
    );
}