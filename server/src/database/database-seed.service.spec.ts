import { describe, expect, it, jest } from '@jest/globals';
import { DatabaseSeedService } from './database-seed.service';

describe('DatabaseSeedService', () => {
    it('should ensure default profile, game models and demo users on bootstrap', async () => {
        const appProfileService = {
            ensureProfileInitialized: jest.fn(async () => undefined),
        };
        const gameModelService = {
            ensureDefaultGameModels: jest.fn(async () => undefined),
        };
        const usersService = {
            ensureDemoUsers: jest.fn(async () => undefined),
        };
        const service = new DatabaseSeedService(
            appProfileService as never,
            gameModelService as never,
            usersService as never,
        );

        await service.onApplicationBootstrap();

        expect(appProfileService.ensureProfileInitialized).toHaveBeenCalledTimes(1);
        expect(gameModelService.ensureDefaultGameModels).toHaveBeenCalledTimes(1);
        expect(usersService.ensureDemoUsers).toHaveBeenCalledTimes(1);
    });
});