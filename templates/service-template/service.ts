import { FeatureRepository } from "./repository";

export class FeatureService {
  constructor(private readonly repo: FeatureRepository) {}

  async executeBusinessLogic(id: string) {
    try {
      const data = await this.repo.findById(id);
      if (!data) {
        return { success: false, error: "Not Found" };
      }

      // Perform business logic here
      // NEVER access DB directly here, always use repo.

      return { success: true, data };
    } catch (error) {
      return { success: false, error: "Internal Error" };
    }
  }
}
