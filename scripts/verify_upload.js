const fs = require('fs');
const path = require('path');

async function testUpload() {
    const csvContent = `pin,name,email,years of experience,current role,ADS score,target role
123,John Doe,john@example.com,5,Frontend Dev,85,Full Stack Developer
124,Jane Smith,jane@example.com,3,Back-end Developer,90,DevOps Eng`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', blob, 'test.csv');

    try {
        const response = await fetch('http://localhost:3000/api/admin/employee-upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('Error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
            return;
        }

        const result = await response.text();
        console.log('Success! Received CSV:');
        console.log(result);
    } catch (err) {
        console.error('Fetch failed:', err);
    }
}

testUpload();
