/** @type {import('next').NextConfig} */
const nextConfig = {
  /* The llms routes and catalog route read content/ and harness/standards/
     with fs at build time; include them in file tracing for deploys. */
  outputFileTracingIncludes: {
    "/llms.txt": ["./content/**/*", "./harness/standards/**/*"],
    "/llms-full.txt": ["./content/**/*", "./harness/standards/**/*"],
    "/standards/catalog.yaml": ["./harness/standards/**/*"],
    /* The per-control detail page reads the catalog + controls/<id>.md via
       getControlDetail at build time; trace those files into the route. */
    "/standards/catalog/[id]": ["./harness/standards/**/*"],
    /* The .md twin route and the sitemap read content/ and harness/standards/
       with fs at build time; include them so they bundle on deploy. */
    "/md/[...path]": ["./content/**/*", "./harness/standards/**/*"],
    "/sitemap.xml": ["./content/**/*", "./harness/standards/**/*"],
  },
};
export default nextConfig;
