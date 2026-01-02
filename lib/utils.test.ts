import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("combines class names correctly", () => {
    expect(cn("flex", "p-4")).toBe("flex p-4");
  });

  it("merges tailwind classes correctly (resolving conflicts)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    expect(cn("flex", true && "p-4", false && "mx-2")).toBe("flex p-4");
  });

  it("handles array inputs", () => {
    expect(cn(["flex", "justify-center"])).toBe("flex justify-center");
  });
});
