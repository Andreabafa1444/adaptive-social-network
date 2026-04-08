const fs   = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "build", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

console.log("CSS antes:", html.match(/<link[^>]+\.css[^>]+>/)?.[0]);

html = html.replace(
  /<link([^>]*?)href="(\/static\/css\/[^"]+\.css)"([^>]*?)rel="stylesheet"([^>]*?)>/g,
  '<link rel="preload" href="$2" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="$2"></noscript>'
).replace(
  /<link([^>]*?)rel="stylesheet"([^>]*?)href="(\/static\/css\/[^"]+\.css)"([^>]*?)>/g,
  '<link rel="preload" href="$3" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="$3"></noscript>'
);

console.log("CSS después:", html.match(/<link[^>]+\.css[^>]+>/)?.[0]);

fs.writeFileSync(indexPath, html, "utf8");
console.log("✅ postbuild completado");