import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authService from '../service';
import * as authRepository from '../repository';
import * as usersRepository from '../../users/repository';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../repository');
jest.mock('../../users/repository');

const mockRepository = authRepository as jest.Mocked<typeof authRepository>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockUsersRepository = usersRepository as jest.Mocked<typeof usersRepository>;

describe('Auth Service', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    password_hash: 'hashed_password',
  };

  const mockJwtPayload = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return null if user not found', async () => {
      mockRepository.search_credentials.mockResolvedValue(null);

      const result = await authService.login('test@example.com', 'password');

      expect(result).toBeNull();
      expect(mockRepository.search_credentials).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    it('should return null if password does not match', async () => {
      mockRepository.search_credentials.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await authService.login('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashed_password'
      );
    });

    it('should return user payload if credentials are correct', async () => {
      mockRepository.search_credentials.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await authService.login('test@example.com', 'password');

      expect(result).toEqual(mockJwtPayload);
    });

    it('should return null on error', async () => {
      mockRepository.search_credentials.mockRejectedValue(
        new Error('DB Error')
      );

      const result = await authService.login('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    it('should generate and save token pair', async () => {
      const mockAccessToken = 'access_token';
      const mockRefreshToken = 'refresh_token';

      mockJwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);
      mockRepository.saveRefreshToken.mockResolvedValue(undefined);

      const result = await authService.generateTokenPair(mockJwtPayload);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(mockRepository.saveRefreshToken).toHaveBeenCalledWith(
        '123',
        mockRefreshToken
      );
    });

    it('should return null if saving refresh token fails', async () => {
      mockJwt.sign
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');
      mockRepository.saveRefreshToken.mockRejectedValue(
        new Error('DB Error')
      );

      const result = await authService.generateTokenPair(mockJwtPayload);

      expect(result).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload for valid token', () => {
      mockJwt.verify.mockReturnValue(mockJwtPayload as never);

      const result = authService.verifyToken('valid_token');

      expect(result).toEqual(mockJwtPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith(
        'valid_token',
        expect.any(String)
      );
    });

    it('should return null for invalid token', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = authService.verifyToken('invalid_token');

      expect(result).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token for valid refresh token', async () => {
      const newAccessToken = 'new_access_token';

      mockJwt.verify.mockReturnValue(mockJwtPayload as never);
      mockRepository.isRefreshTokenValid.mockResolvedValue(true);
      mockJwt.sign.mockReturnValue(newAccessToken);

      const result = await authService.refreshAccessToken('valid_refresh_token');

      expect(result).toBe(newAccessToken);
      expect(mockRepository.isRefreshTokenValid).toHaveBeenCalledWith(
        '123',
        'valid_refresh_token'
      );
    });

    it('should return null if refresh token is invalid', async () => {
      mockJwt.verify.mockReturnValue(mockJwtPayload as never);
      mockRepository.isRefreshTokenValid.mockResolvedValue(false);

      const result = await authService.refreshAccessToken('invalid_refresh_token');

      expect(result).toBeNull();
    });

    it('should return null if refresh token verification fails', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authService.refreshAccessToken('invalid_token');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
    };

    it('should return null if email already exists', async () => {
      mockUsersRepository.getByEmail.mockResolvedValue(mockUser);

      const result = await authService.register(registerDto);

      expect(result).toBeNull();
    });

    it('should register user and return user data with tokens', async () => {
      const mockHashedPassword = 'hashed_password';
      const mockTokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      mockUsersRepository.getByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
      mockUsersRepository.create_user.mockResolvedValue({
        ...mockUser,
        password_hash: mockHashedPassword,
      });
      mockJwt.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);
      mockRepository.saveRefreshToken.mockResolvedValue(undefined);

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should return null if token generation fails', async () => {
      mockUsersRepository.getByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed_password' as never);
      mockUsersRepository.create_user.mockResolvedValue(mockUser);
      mockJwt.sign
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');
      mockRepository.saveRefreshToken.mockRejectedValue(
        new Error('DB Error')
      );

      const result = await authService.register(registerDto);

      expect(result).toBeNull();
    });
  });
});
