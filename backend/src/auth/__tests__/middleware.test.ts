import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/authHandler';
import * as authService from '../service';

jest.mock('../service');

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no token provided', () => {
    mockRequest.headers = {};

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No token provide',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid_token',
    };
    mockAuthService.verifyToken.mockReturnValue(null);

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should attach user to request and call next for valid token', () => {
    const mockPayload = {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    };

    mockRequest.headers = {
      authorization: 'Bearer valid_token',
    };
    mockAuthService.verifyToken.mockReturnValue(mockPayload);

    authMiddleware(
      mockRequest as any,
      mockResponse as Response,
      mockNext
    );

    expect(mockRequest.user).toEqual(mockPayload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should extract token from Bearer header correctly', () => {
    mockRequest.headers = {
      authorization: 'Bearer token123',
    };
    mockAuthService.verifyToken.mockReturnValue({
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    });

    authMiddleware(
      mockRequest as any,
      mockResponse as Response,
      mockNext
    );

    expect(mockAuthService.verifyToken).toHaveBeenCalledWith('token123');
  });
});
