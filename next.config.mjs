/** @type {import('next').NextConfig} */
const nextConfig = {
  /* The llms routes and catalog route read content/ and harness/standards/
     with fs at build time; include them in file tracing for deploys. */
  outputFileTracingIncludes: {
    "/llms.txt": ["./content/**/*", "./harness/standards/**/*"],
    "/llms-full.txt": ["./content/**/*", "./harness/standards/**/*"],
    "/standards/catalog.yaml": ["./harness/standards/**/*"],
  },
};
export default nextConfig;
