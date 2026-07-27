// ✅ GOOD: Service contains only business logic, delegates DB to repository
import { JournalRepository } from "../repository/JournalRepository";

export class JournalService {
  constructor(private readonly repo: JournalRepository) {}

  async findAll() {
    return this.repo.findAll();
  }

  async create(payload: CreateJournalPayload) {
    // Business rule: ISSN must be unique
    if (payload.issn_print) {
      const existing = await this.repo.findByIssn(payload.issn_print);
      if (existing) {
        return { success: false, error: "DUPLICATE_ISSN" };
      }
    }
    const journal = await this.repo.create(payload);
    return { success: true, data: journal };
  }
}
