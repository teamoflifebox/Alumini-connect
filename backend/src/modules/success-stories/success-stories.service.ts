import { successStoriesRepository } from './success-stories.repository';

export class SuccessStoriesService {
  async getAllStories() {
    return await successStoriesRepository.getAllStories();
  }

  async createStory(title: string, content: string, alumniName: string, alumniDesignation: string, imageUrl: string, createdBy: string, category: string = 'story') {
    return await successStoriesRepository.createStory(title, content, alumniName, alumniDesignation, imageUrl, createdBy, category);
  }

  async deleteStory(id: string) {
    return await successStoriesRepository.deleteStory(id);
  }
}

export const successStoriesService = new SuccessStoriesService();
