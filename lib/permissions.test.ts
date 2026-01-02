import { describe, it, expect } from "vitest";
import {
  hasPermission,
  PERMISSIONS,
  type Role,
  type Action,
} from "./permissions";

describe("Permissions System", () => {
  it("allows owner to perform all actions", () => {
    const ownerActions = PERMISSIONS["owner"];
    ownerActions.forEach((action) => {
      expect(hasPermission("owner", action)).toBe(true);
    });
  });

  it("allows admin to manage team and billing", () => {
    expect(hasPermission("admin", "manage_team")).toBe(true);
    expect(hasPermission("admin", "manage_billing")).toBe(true);
  });

  it("allows editor to create and edit content but not manage team", () => {
    expect(hasPermission("editor", "create_content")).toBe(true);
    expect(hasPermission("editor", "edit_content")).toBe(true);
    expect(hasPermission("editor", "manage_team")).toBe(false);
  });

  it("allows writer to create and edit content but not publish", () => {
    expect(hasPermission("writer", "create_content")).toBe(true);
    expect(hasPermission("writer", "edit_content")).toBe(true);
    expect(hasPermission("writer", "publish_content")).toBe(false);
  });

  it("allows viewer no permissions", () => {
    const allActions: Action[] = [
      "manage_team",
      "manage_billing",
      "create_content",
      "edit_content",
      "publish_content",
      "delete_content",
    ];
    allActions.forEach((action) => {
      expect(hasPermission("viewer", action)).toBe(false);
    });
  });

  it("returns false for unknown permissions", () => {
    expect(hasPermission("viewer", "non_existent_action" as Action)).toBe(
      false
    );
  });
});
