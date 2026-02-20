const express = require('express');
// const request = require('supertest');
// I'll make a script that imports app and prints routes.

// Better: I'll print the router stack.
const router = require('./routes/admissions');
console.log('Router stack size:', router.stack.length);

router.stack.forEach((r, i) => {
    if (r.route && r.route.path) {
        console.log(`Route ${i}: ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    }
});
