import { Request, Response } from 'express';
import * as authController from '../controller';
import * as authService from '../service';

jest.mock('../../middleware/errorHandler', () => {
    const original = jest.requireActual('../../middleware/errorHandler');
    return {
        ...original,
        asyncHandler: (fn: any) => async (req: any, res: any, next: any) => {
            try { await fn(req, res, next); } catch (err) { next(err); }
        },
    };
});
jest.mock('../service');

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = { body: {} };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should call next with 400 if email is missing', async () => {
            mockRequest.body = { password: 'password123' };

            await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should call next with 400 if password is missing', async () => {
            mockRequest.body = { email: 'test@example.com' };

            await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should call next with 401 if credentials are invalid', async () => {
            mockRequest.body = { email: 'test@example.com', password: 'wrong' };
            mockAuthService.login.mockResolvedValue(null);

            await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
        });

        it('should call next with 500 if token generation fails', async () => {
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            mockAuthService.login.mockResolvedValue({ id: '1', email: 'test@example.com', username: 'user' });
            mockAuthService.generateTokenPair.mockResolvedValue(null);

            await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });

        it('should return tokens on successful login', async () => {
            const mockTokens = { accessToken: 'access_token', refreshToken: 'refresh_token' };
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            mockAuthService.login.mockResolvedValue({ id: '1', email: 'test@example.com', username: 'user' });
            mockAuthService.generateTokenPair.mockResolvedValue(mockTokens);

            await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.json).toHaveBeenCalledWith(mockTokens);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('refresh_controller', () => {
        it('should call next with 400 if refresh token is missing', async () => {
            mockRequest.body = {};

            await authController.refresh_controller(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should call next with 401 if refresh token is invalid', async () => {
            mockRequest.body = { refreshToken: 'invalid_token' };
            mockAuthService.refreshAccessToken.mockResolvedValue(null);

            await authController.refresh_controller(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
        });

        it('should return new access token on successful refresh', async () => {
            mockRequest.body = { refreshToken: 'valid_refresh_token' };
            mockAuthService.refreshAccessToken.mockResolvedValue('new_access_token');

            await authController.refresh_controller(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.json).toHaveBeenCalledWith({ accessToken: 'new_access_token' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should call next with 400 if email or password is missing', async () => {
            mockRequest.body = { email: 'test@example.com' };

            await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should call next with 500 if registration fails', async () => {
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            mockAuthService.register.mockResolvedValue(null);

            await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });

        it('should return 201 with user and tokens on successful registration', async () => {
            const mockResult = {
                user: { id: '1', email: 'test@example.com', username: 'user', first_name: null, last_name: null },
                accessToken: 'access_token',
                refreshToken: 'refresh_token',
            };
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            mockAuthService.register.mockResolvedValue(mockResult);

            await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
