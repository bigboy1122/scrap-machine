import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLogger } from "./logger";

describe("Logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info messages at info level", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createLogger("info");

    log.info("test message", { key: "value" });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("test message");
    expect(spy.mock.calls[0][0]).toContain('"key":"value"');
  });

  it("suppresses debug messages at info level", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = createLogger("info");

    log.debug("should not appear");

    expect(spy).not.toHaveBeenCalled();
  });

  it("logs debug messages at debug level", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = createLogger("debug");

    log.debug("debug info");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("routes errors to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const log = createLogger("error");

    log.error("something broke", { code: 500 });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("something broke");
  });

  it("routes warnings to console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = createLogger("warn");

    log.warn("caution");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("allows changing log level at runtime", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = createLogger("info");

    log.debug("suppressed");
    expect(debugSpy).not.toHaveBeenCalled();

    log.setLevel("debug");
    log.debug("visible");
    expect(debugSpy).toHaveBeenCalledTimes(1);
  });

  it("returns current log level", () => {
    const log = createLogger("warn");
    expect(log.getLevel()).toBe("warn");
  });

  it("includes ISO timestamp in output", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createLogger("info");

    log.info("timestamped");

    const output = spy.mock.calls[0][0] as string;
    expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("logs without context when none provided", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createLogger("info");

    log.info("no context");

    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain("no context");
    expect(output).not.toContain("{");
  });

  it("suppresses all output at silent level", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const log = createLogger("silent");

    log.error("should not appear");

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
