const express = require('express');
const request = require('supertest');
const router = require('./routes/admissions'); // Mocking or using actual depending on deps
const app = express();

app.use(express.json());
// Mock auth middleware
jest.mock('./middleware/auth', () => ({
    protect: (req, res, next) => { req.user = { role: 'admin' }; next(); },
    authorize: (role) => (req, res, next) => next()
}));
// Mock upload middleware
jest.mock('./middleware/upload', () => ({
    fields: () => (req, res, next) => next()
}));
// Mock controllers
jest.mock('./controllers/admissionController', () => ({
    createAdmission: (req, res) => res.send('createAdmission'),
    createAdmissionAdmin: (req, res) => res.send('createAdmissionAdmin'),
    getAdmissions: (req, res) => res.send('getAdmissions'),
    getMyAdmission: (req, res) => res.send('getMyAdmission'),
    approveAdmission: (req, res) => res.send('approveAdmission'),
    exportAdmissions: (req, res) => res.send('exportAdmissions')
}));

app.use('/api/admissions', router);

test('POST /api/admissions/admin should reach crateAdmissionAdmin', async () => {
    const res = await request(app).post('/api/admissions/admin');
    expect(res.status).not.toBe(404);
});
