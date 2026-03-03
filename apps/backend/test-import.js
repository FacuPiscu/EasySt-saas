const http = require('http');

const data = JSON.stringify({
    products: [
        {
            id: "a1",
            name: "Test item",
            price: 15,
            reorderPoint: 5,
            batches: []
        }
    ]
});

const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/products/bulk-import',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, res => {
    let body = '';
    res.on('data', d => { body += d; });
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => {
    console.error('Request Error:', e);
});

req.write(data);
req.end();
