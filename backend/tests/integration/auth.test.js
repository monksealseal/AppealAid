const request = require('supertest');
const { expect } = require('chai');
const app = require('../../server');

describe('Auth API Integration Tests', () => {
  let server;
  let token;
  
  before(function(done) {
    // Start the server for testing
    // For testing purposes, we'll use a different port
    server = app.listen(5001, () => {
      console.log('Test server started on port 5001');
      done();
    });
  });
  
  after(function(done) {
    // Close the server after tests
    if (server) {
      server.close(() => {
        console.log('Test server closed');
        done();
      });
    } else {
      done();
    }
  });
  
  describe('POST /api/users', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          firstName: 'Integration',
          lastName: 'Test',
          email: 'integration@test.com',
          password: 'password123'
        });
      
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('_id');
      expect(response.body).to.have.property('firstName', 'Integration');
      expect(response.body).to.have.property('lastName', 'Test');
      expect(response.body).to.have.property('email', 'integration@test.com');
      expect(response.body).to.have.property('token');
    });
  });
  
  describe('POST /api/users/login', () => {
    it('should login a user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('_id');
      expect(response.body).to.have.property('email', 'integration@test.com');
      expect(response.body).to.have.property('token');
      
      // Save token for authenticated requests
      token = response.body.token;
    });
  });
  
  describe('GET /api/users/profile', () => {
    it('should get user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('_id');
      expect(response.body).to.have.property('firstName');
      expect(response.body).to.have.property('lastName');
      expect(response.body).to.have.property('email');
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile');
      
      expect(response.status).to.equal(401);
    });
  });
  
  describe('PUT /api/users/profile', () => {
    it('should update user profile when authenticated', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Updated',
          lastName: 'Profile',
          insuranceInfo: {
            carrier: 'Test Insurance Co',
            memberId: 'TEST123',
            groupNumber: 'GRP123'
          }
        });
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('_id');
      expect(response.body).to.have.property('firstName', 'Updated');
      expect(response.body).to.have.property('lastName', 'Profile');
      expect(response.body.insuranceInfo).to.have.property('carrier', 'Test Insurance Co');
    });
  });
});