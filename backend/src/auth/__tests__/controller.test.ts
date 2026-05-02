import { Request, Response } from 'express';
import * as authController from '../controller';
import * as authService from '../service';

jest.mock('../service');

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 if body is missing', async () => {
      mockRequest.body = undefined;

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'missing information',
      });
    });

    it('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'password123' };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockAuthService.login.mockResolvedValue(null);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'user not found',
      });
    });

    it('should return 500 if token generation fails', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
      };
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockAuthService.login.mockResolvedValue(mockUser);
      mockAuthService.generateTokenPair.mockResolvedValue(null);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Try again',
      });
    });

    it('should return tokens on successful login', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
      };
      const mockTokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockAuthService.login.mockResolvedValue(mockUser);
      mockAuthService.generateTokenPair.mockResolvedValue(mockTokens);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockTokens);
    });
  });

  describe('refresh_controller', () => {
    it('should return 400 if refresh token is missing', async () => {
      mockRequest.body = {};

      await authController.refresh_controller(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'missing refresh token',
      });
    });

    it('should return 401 if refresh token is invalid', async () => {
      mockRequest.body = { refreshToken: 'invalid_token' };
      mockAuthService.refreshAccessToken.mockResolvedValue(null);

      await authController.refresh_controller(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid refresh token',
      });
    });

    it('should return new access token on successful refresh', async () => {
      const newAccessToken = 'new_access_token';
      mockRequest.body = { refreshToken: 'valid_refresh_token' };
      mockAuthService.refreshAccessToken.mockResolvedValue(newAccessToken);

      await authController.refresh_controller(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: newAccessToken,
      });
    });
  });

  describe('register', () => {
    it('should return 400 if email or password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'missing email or password',
      });
    });

    it('should return 400 if register fails', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockAuthService.register.mockResolvedValue(null);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 201 with user and tokens on successful registration', async () => {
      const mockResult = {
        user: {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          first_name: null,
          last_name: null,
        },
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };
      mockAuthService.register.mockResolvedValue(mockResult);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });
});
