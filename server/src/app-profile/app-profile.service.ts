import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAppProfileDto } from './dto/update-app-profile.dto';
import { AppProfileEntity } from './entities/app-profile.entity';

const APP_PROFILE_PRIMARY_ID = 1;

const defaultAppProfile = {
  appName: '',
  appWordmark: 'PULSEPLAY',
  logoText: 'PP',
  description: '未登录官网与 `/game` 已登录模块分离的运动科技风示例。',
  officialSiteLabel: 'PULSEPLAY LAB',
  defaultOrganizationName: '',
  defaultEmailDomain: 'pulseplay.com',
  defaultUserAvatar:
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%237c3aed'/%3E%3Cstop offset='1' stop-color='%232563eb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='96' height='96' rx='28' fill='url(%23g)'/%3E%3Ccircle cx='48' cy='34' r='16' fill='rgba(255,255,255,0.92)'/%3E%3Cpath d='M24 78c3-13 14-22 24-22s21 9 24 22' fill='rgba(255,255,255,0.92)'/%3E%3C/svg%3E",
};

@Injectable()
export class AppProfileService {
  constructor(
    @InjectRepository(AppProfileEntity)
    private readonly appProfileRepository: Repository<AppProfileEntity>,
  ) {}

  async getProfile() {
    const profile = await this.ensureProfile();
    return this.toResponse(profile);
  }

  async updateProfile(input: UpdateAppProfileDto) {
    const profile = await this.ensureProfile();

    Object.assign(profile, this.normalizeInput(input));

    const saved = await this.appProfileRepository.save(profile);
    return this.toResponse(saved);
  }

  private async ensureProfile() {
    const existing = await this.appProfileRepository.findOne({
      where: { id: APP_PROFILE_PRIMARY_ID },
    });

    if (existing) {
      return existing;
    }

    const created = this.appProfileRepository.create({
      id: APP_PROFILE_PRIMARY_ID,
      ...defaultAppProfile,
    });

    return this.appProfileRepository.save(created);
  }

  private normalizeInput(input: UpdateAppProfileDto) {
    const nextInput: UpdateAppProfileDto = {};

    if (typeof input.appName === 'string') {
      nextInput.appName = input.appName.trim();
    }

    if (typeof input.appWordmark === 'string') {
      nextInput.appWordmark = input.appWordmark.trim();
    }

    if (typeof input.logoText === 'string') {
      nextInput.logoText = input.logoText.trim();
    }

    if (typeof input.description === 'string') {
      nextInput.description = input.description.trim();
    }

    if (typeof input.officialSiteLabel === 'string') {
      nextInput.officialSiteLabel = input.officialSiteLabel.trim();
    }

    if (typeof input.defaultOrganizationName === 'string') {
      nextInput.defaultOrganizationName = input.defaultOrganizationName.trim();
    }

    if (typeof input.defaultEmailDomain === 'string') {
      nextInput.defaultEmailDomain = input.defaultEmailDomain.trim();
    }

    if (typeof input.defaultUserAvatar === 'string') {
      nextInput.defaultUserAvatar = input.defaultUserAvatar.trim();
    }

    return nextInput;
  }

  private toResponse(profile: AppProfileEntity) {
    return {
      appName: profile.appName,
      appWordmark: profile.appWordmark,
      logoText: profile.logoText,
      description: profile.description,
      officialSiteLabel: profile.officialSiteLabel,
      defaultOrganizationName: profile.defaultOrganizationName,
      defaultEmailDomain: profile.defaultEmailDomain,
      defaultUserAvatar: profile.defaultUserAvatar,
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
