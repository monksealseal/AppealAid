const { expect } = require('chai');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../../controllers/userController');

describe('User Controller Tests', () => {
  
  describe('registerUser', () => {
    it('should register a new user', async () => {
      // Create mock request and response
      const req = {
        body: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.body = data;
          return this;
        }
      };
      
      // Call the controller function
      await registerUser(req, res);
      
      // Assert response
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('firstName', 'Test');
      expect(res.body).to.have.property('lastName', 'User');
      expect(res.body).to.have.property('email', 'test@example.com');
      expect(res.body).to.have.property('token');
    });
  });
  
  describe('loginUser', () => {
    it('should login a user', async () => {
      // Create mock request and response
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.body = data;
          return this;
        }
      };
      
      // Call the controller function
      await loginUser(req, res);
      
      // Assert response
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('email', 'test@example.com');
      expect(res.body).to.have.property('token');
    });
  });
  
  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      // Create mock request and response
      const req = {
        user: {
          id: '1234567890',
          email: 'test@example.com',
          role: 'patient'
        }
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.body = data;
          return this;
        }
      };
      
      // Call the controller function
      await getUserProfile(req, res);
      
      // Assert response
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('email');
      expect(res.body).to.have.property('firstName');
      expect(res.body).to.have.property('lastName');
      expect(res.body).to.have.property('insuranceInfo');
    });
  });
  
  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      // Create mock request and response
      const req = {
        user: {
          id: '1234567890',
          email: 'test@example.com',
          role: 'patient'
        },
        body: {
          firstName: 'Updated',
          lastName: 'Name',
          email: 'updated@example.com',
          insuranceInfo: {
            carrier: 'Updated Insurance',
            memberId: '987654321',
            groupNumber: 'NEWGROUP'
          }
        }
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.body = data;
          return this;
        }
      };
      
      // Call the controller function
      await updateUserProfile(req, res);
      
      // Assert response
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('firstName', 'Updated');
      expect(res.body).to.have.property('lastName', 'Name');
      expect(res.body).to.have.property('email', 'updated@example.com');
      expect(res.body.insuranceInfo).to.have.property('carrier', 'Updated Insurance');
      expect(res.body.insuranceInfo).to.have.property('memberId', '987654321');
      expect(res.body.insuranceInfo).to.have.property('groupNumber', 'NEWGROUP');
      expect(res.body).to.have.property('message', 'Profile updated successfully');
    });
  });
});