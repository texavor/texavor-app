import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce hook", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("updates the value after the delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // Update the value
    rerender({ value: "updated", delay: 500 });

    // Should still be initial immediately
    expect(result.current).toBe("initial");

    // Fast-forward time manually
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should be updated now
    expect(result.current).toBe("updated");
    vi.useRealTimers();
  });

  it("cancels the previous timer if value changes quickly", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // Update to 'intermediate'
    rerender({ value: "intermediate", delay: 500 });

    // Advance only 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should still be initial
    expect(result.current).toBe("initial");

    // Update to 'final'
    rerender({ value: "final", delay: 500 });

    // Advance 300ms (total 500ms since first change, but timer reset)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should ideally still be initial if logic holds (as timer reset)
    // The new timer needs another 200ms (total 500ms from second change)
    expect(result.current).toBe("initial");

    // Advance remaining 200ms
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe("final");
    vi.useRealTimers();
  });
});
