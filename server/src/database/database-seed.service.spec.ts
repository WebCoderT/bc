import { DatabaseSeedService } from './database-seed.service';

describe('DatabaseSeedService', () => {
    it('should ensure default profile and demo users on bootstrap', async () => {
        const appProfileService = {
            ensureProfileInitialized: jest.fn().mockResolvedValue(undefined),
        };
        const usersService = {
            ensureDemoUsers: jest.fn().mockResolvedValue(undefined),
        };
        const service = new DatabaseSeedService(
            appProfileService as never,
            usersService as never,
        );

        await service.onApplicationBootstrap();

        expect(appProfileService.ensureProfileInitialized).toHaveBeenCalledTimes(1);
        expect(usersService.ensureDemoUsers).toHaveBeenCalledTimes(1);
    });
});