import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The Java runner is a separate process; nothing here executes Java.
  outputFileTracingExcludes: { "*": ["materials/**", ".tools/**", "java-grader/**/target/**"] },
};

export default nextConfig;
