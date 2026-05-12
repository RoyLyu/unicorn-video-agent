import { pathToFileURL } from "node:url";

import {
  frozenProductDemo,
  productDemoExportLinks,
  productDemoNavigationLinks
} from "@/lib/product-demo/frozen-product-demo";

export function getProductDemoLines() {
  return [
    "Product Demo paths",
    `Product Demo: ${frozenProductDemo.paths.productDemo}`,
    ...productDemoNavigationLinks.map((link) => `${link.label}: ${link.href}`),
    ...productDemoExportLinks.map((link) => `${link.label}: ${link.href}`)
  ];
}

function main() {
  for (const line of getProductDemoLines()) {
    console.log(line);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
