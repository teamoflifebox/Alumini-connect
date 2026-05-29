import { settingsRepository } from './settings.repository';
import { UserSettings } from './settings.types';
import { AppError } from '../../utils/AppError';

export class SettingsService {
  async getSettings(userId: string): Promise<UserSettings> {
    let settings = await settingsRepository.getSettingsByUserId(userId);
    if (!settings) {
      settings = await settingsRepository.createDefaultSettings(userId);
    }
    return settings;
  }

  async updateSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    let settings = await settingsRepository.getSettingsByUserId(userId);
    if (!settings) {
      await settingsRepository.createDefaultSettings(userId);
    }
    return settingsRepository.updateSettings(userId, data);
  }
}

export const settingsService = new SettingsService();
