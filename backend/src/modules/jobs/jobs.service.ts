import { jobsRepository } from './jobs.repository';
import { CreateJobDTO } from './jobs.types';

export class JobsService {
  async createJob(userId: string, jobData: CreateJobDTO) {
    // Add business logic here later (e.g., check if user is verified alumni)
    return await jobsRepository.createJob(userId, jobData);
  }

  async getAllJobs() {
    return await jobsRepository.getAllJobs();
  }
}

export const jobsService = new JobsService();
