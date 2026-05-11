// Test script to verify confirmPayment endpoint
// Run with: node test-confirm-payment.js

const testOrderId = 298; // Replace with actual order ID from your screenshot

fetch(`http://localhost:3000/admin/confirmPayment/${testOrderId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        // Add your auth token if needed
    },
    credentials: 'include'
})
.then(response => response.json())
.then(data => {
    console.log('Success:', data);
})
.catch(error => {
    console.error('Error:', error);
});
