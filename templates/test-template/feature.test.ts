import { describe, it, expect, vi } from "vitest";
import { FeatureService } from "../service";

describe("FeatureService", () => {
  it("should execute business logic successfully", async () => {
    // Mock Repo
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({ id: "1", name: "Test" }),
    };

    const service = new FeatureService(mockRepo as any);
    const result = await service.executeBusinessLogic("1");

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Test");
  });
});
