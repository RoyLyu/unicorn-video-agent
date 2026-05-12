import { z } from "zod";

export const ShotDensityProfileSchema = z.enum(["lite", "standard", "dense"]);

export type ShotDensityProfile = z.infer<typeof ShotDensityProfileSchema>;

export type ShotDensitySpec = {
  profile: ShotDensityProfile;
  min90s: number;
  min180s: number;
  minTotal: number;
};

export const shotDensitySpecs: Record<ShotDensityProfile, ShotDensitySpec> = {
  lite: {
    profile: "lite",
    min90s: 20,
    min180s: 40,
    minTotal: 60
  },
  standard: {
    profile: "standard",
    min90s: 24,
    min180s: 48,
    minTotal: 72
  },
  dense: {
    profile: "dense",
    min90s: 30,
    min180s: 60,
    minTotal: 90
  }
};

export function parseShotDensityProfile(value: unknown): ShotDensityProfile {
  const parsed = ShotDensityProfileSchema.safeParse(value);

  return parsed.success ? parsed.data : "standard";
}

export function readShotDensityProfile(
  env: Partial<Record<string, string | undefined>> = process.env
): ShotDensityProfile {
  return parseShotDensityProfile(env.SHOT_DENSITY_PROFILE);
}

export function getShotDensitySpec(profile: ShotDensityProfile = "standard") {
  return shotDensitySpecs[profile];
}
