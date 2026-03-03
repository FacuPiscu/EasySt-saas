const http = require('http');

const authData = JSON.stringify({ email: "admin@easyst.com", password: "dummy-password" /* doesn't matter we just use whatever */ });
// I'll just write a script that attempts to login, grabs token, and posts. 
