'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config.prod');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require('react-dev-utils/printHostingInstructions');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const useYarn = fs.existsSync(paths.yarnLockFile);

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

// Get target browser from environment variable
const targetBrowser = process.env.BROWSER || 'chrome';

// Validate browser
const validBrowsers = ['chrome', 'firefox'];
if (!validBrowsers.includes(targetBrowser)) {
  console.error(chalk.red(`Invalid browser: ${targetBrowser}. Use one of: ${validBrowsers.join(', ')}`));
  process.exit(1);
}

// Set output directory based on browser
const outputDir = path.resolve(paths.appBuild, targetBrowser);

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(outputDir)
  .then(previousFileSizes => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(outputDir);
    
    // Generate browser-specific manifest
    const { generateManifest } = require('./generate-manifest');
    generateManifest(targetBrowser, outputDir);
    
    // Merge with the public folder
    copyPublicFolder(outputDir);
    
    // Copy background service worker
    copyBackgroundFile(outputDir);
    
    // Start the webpack build
    return build(previousFileSizes, outputDir);
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        );
      } else {
        console.log(chalk.green(`Compiled successfully for ${targetBrowser}.\n`));
      }

      console.log('File sizes after gzip:\n');
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        outputDir,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      );
      console.log();

      const appPackage = require(paths.appPackageJson);
      const publicUrl = paths.publicUrl;
      const publicPath = config.output.publicPath;
      const buildFolder = path.relative(process.cwd(), outputDir);
      printHostingInstructions(
        appPackage,
        publicUrl,
        publicPath,
        buildFolder,
        useYarn
      );
    },
    err => {
      console.log(chalk.red('Failed to compile.\n'));
      printBuildError(err);
      process.exit(1);
    }
  );

// Create the production build and print the deployment instructions.
function build(previousFileSizes, outputDir) {
  console.log(`Creating an optimized production build for ${targetBrowser}...`);

  // Get browser-specific webpack config
  const config = configFactory({ target: targetBrowser, outputDir });

  let compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      const messages = formatWebpackMessages(stats.toJson({}, true));
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }
      return resolve({
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      });
    });
  });
}

function copyPublicFolder(outputDir) {
  fs.copySync(paths.appPublic, outputDir, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

function copyBackgroundFile(outputDir) {
  const backgroundPath = path.resolve(paths.appSrc, 'background.js');
  const destPath = path.resolve(outputDir, 'app', 'background.js');
  
  try {
    // Ensure the app directory exists
    fs.ensureDirSync(path.resolve(outputDir, 'app'));
    // Copy the background service worker
    fs.copySync(backgroundPath, destPath);
    console.log(`Copied background.js to ${destPath}`);
  } catch (error) {
    console.error('Error copying background.js:', error);
  }
}
