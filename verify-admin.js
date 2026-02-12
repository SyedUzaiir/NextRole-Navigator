const seedAdmin = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/admin/seed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'secure123' })
        });
        const data = await response.json();
        console.log('Seed Response:', data);
    } catch (error) {
        console.error('Seed Error:', error);
    }
};

seedAdmin();
