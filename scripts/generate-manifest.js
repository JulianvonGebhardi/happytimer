/**
 * generate-manifest.js - Generates browser-specific manifest files
 * Creates Chrome and Firefox manifests with appropriate differences
 */

const fs = require('fs');
const path = require('path');

const BASE_MANIFEST = {
  manifest_version: 3,
  name: "HappyTimer",
  version: "2.0.0",
  short_name: "HappyTimer",
  author: "Julian von Gebhardi",
  description: "Stay ahead of your time and break out of addictive software features and brain fatigue by using HappyTimer.",
  homepage_url: "https://airtable.com/shrpzD6EmFLs6R2sK",
  icons: {
    "16": "icon-timer.png",
    "32": "icon-timer.png",
    "48": "icon-timer.png",
    "128": "icon-timer.png"
  },
  permissions: [
    "storage",
    "tabs",
    "notifications"
  ],
  web_accessible_resources: [
    {
      resources: [
        "/static/css/content.css",
        "/static/media/*.*",
        "/static/fonts/*.*"
      ],
      matches: ["<all_urls>"]
    }
  ],
  content_security_policy: {
    "extension_pages": "script-src 'self' 'unsafe-eval'; object-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:;",
    "sandbox": "sandbox allow-same-origin allow-scripts allow-popups allow-forms"
  }
};

const CHROME_MANIFEST = {
  ...BASE_MANIFEST,
  action: {
    default_icon: "icon-timer.png",
    default_title: "HappyTimer",
    default_popup: "index.html"
  },
  background: {
    service_worker: "/app/background.js",
    type: "module"
  },
  host_permissions: ["<all_urls>"],
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      css: ["/static/css/content.css"],
      js: ["/static/js/content.js"],
      run_at: "document_idle"
    }
  ]
};

const FIREFOX_MANIFEST = {
  ...BASE_MANIFEST,
  // Firefox uses browser_action instead of action
  browser_action: {
    default_icon: "icon-timer.png",
    default_title: "HappyTimer",
    default_popup: "index.html"
  },
  background: {
    scripts: ["/app/background.js"],
    type: "module"
  },
  // Firefox allows webRequest with blocking
  permissions: [
    ...BASE_MANIFEST.permissions,
    "webRequest",
    "webRequestBlocking"
  ],
  host_permissions: ["<all_urls>"],
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      css: ["/static/css/content.css"],
      js: ["/static/js/content.js"],
      run_at: "document_idle"
    }
  ],
  // Firefox-specific: allow using chrome.* namespace
  applications: {
    gecko: {
      id: "happytimer@example.com",
      strict_min_version: "109.0"
    }
  }
};

/**
 * Generate manifest for a specific browser
 * @param {string} browser - 'chrome' or 'firefox'
 * @param {string} outputDir - Output directory
 */
function generateManifest(browser, outputDir) {
  let manifest;
  
  switch (browser.toLowerCase()) {
    case 'chrome':
      manifest = CHROME_MANIFEST;
      break;
    case 'firefox':
      manifest = FIREFOX_MANIFEST;
      break;
    default:
      throw new Error(`Unsupported browser: ${browser}. Use 'chrome' or 'firefox'.`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write manifest file
  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`Generated ${browser} manifest: ${manifestPath}`);
  
  return manifest;
}

/**
 * Generate manifests for all browsers
 * @param {string} baseOutputDir - Base output directory (e.g., 'build')
 */
function generateAllManifests(baseOutputDir) {
  const browsers = ['chrome', 'firefox'];
  
  browsers.forEach(browser => {
    const outputDir = path.join(baseOutputDir, browser);
    generateManifest(browser, outputDir);
  });
  
  console.log(`Generated manifests for all browsers in ${baseOutputDir}`);
}

// Export for use in build scripts
module.exports = {
  generateManifest,
  generateAllManifests,
  CHROME_MANIFEST,
  FIREFOX_MANIFEST
};

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const browser = args[0];
  const outputDir = args[1] || path.join(__dirname, '..', 'build', browser);
  
  if (browser) {
    generateManifest(browser, outputDir);
  } else {
    generateAllManifests(path.join(__dirname, '..', 'build'));
  }
}
