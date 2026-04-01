export class Env {
  public static get(name: string, defaultValue?: string): string {
    const value = process.env[name] ?? defaultValue;

    if (value === undefined || value === "") {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
  }

  public static isTrue(name: string, defaultValue = false): boolean {
    const raw = process.env[name];
    if (raw === undefined) {
      return defaultValue;
    }

    return raw.toLowerCase() === "true";
  }
}
