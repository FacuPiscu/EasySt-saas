const http = require('http');

const authData = JSON.stringify({ email: "admin@easyst.com", password: "dummy-password" });

const reqAuth = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(authData)
    }
}, res => {
    let body = '';
    res.on('data', d => { body += d; });
    res.on('end', () => {
        const { token } = JSON.parse(body);
        if (!token) return console.error("No token!", body);

        const data = {
            products: Array.from({ length: 60 }).map((_, i) => ({
                name: "Jugo Naranja " + i,
                price: 15,
                reorderPoint: 5,
                batches: [
                    {
                        barcode: "ABC" + i,
                        cost: 10,
                        stock: 5,
                        expirationDate: new Date().toISOString()
                    }
                ]
            }))
        };

        const payload = JSON.stringify(data);

        const reqPost = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/products/bulk-import',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res2 => {
            let body2 = '';
            res2.on('data', d => { body2 += d; });
            res2.on('end', () => console.log('POST Status:', res2.statusCode, 'Body:', body2));
        });

        reqPost.on('error', console.error);
        reqPost.write(payload);
        reqPost.end();
    });
});

reqAuth.on('error', console.error);
reqAuth.write(authData);
reqAuth.end();
