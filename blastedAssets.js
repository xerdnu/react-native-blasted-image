const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs-extra');
const path = require('path');

function copyAssets(srcDir, destDir, platform) {
  try {
    if (fs.existsSync(srcDir)) {
      console.log(`[BlastedImage][${platform}] Copying assets from ${srcDir} to ${destDir}`);
      fs.ensureDirSync(destDir);
      fs.copySync(srcDir, destDir);
      console.log(`[BlastedImage][${platform}] Assets copied successfully!`);
    } else {
      console.log(`[BlastedImage][${platform}] The source directory ${srcDir} does not exist. As a result, no assets will be bundled with BlastedImage. (Check documentation for more information)`);
    }
  } catch (err) {
    console.error(`[BlastedImage][${platform}] Error copying assets:`, err);
  }
}

const blastedAssets = (config, options = {}) => {
  config = withDangerousMod(config, [
    'android',
    (config) => {
      const androidDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets',
        'blasted-image'
      );
      const absoluteSrcPath = path.resolve(options.assetsPath || process.env.ASSETS_PATH || './assets/blasted-image');
      copyAssets(absoluteSrcPath, androidDir, 'Android');
      return config;
    },
  ]);

  config = withXcodeProject(config, async (config, options = {}) => {
    const { projectRoot } = config.modRequest;
    const iosDir = path.join(projectRoot, 'ios');
    const resourcesDir = path.join(iosDir, 'Resources');
    const blastedImageDir = path.join(resourcesDir, 'blasted-image');
    //const absoluteSrcPath = path.resolve('assets', 'blasted-image');
    const absoluteSrcPath = path.resolve(options.assetsPath || process.env.ASSETS_PATH || './assets/blasted-image');

    fs.ensureDirSync(resourcesDir);

    copyAssets(absoluteSrcPath, path.join(resourcesDir, 'blasted-image'), 'iOS');

    const project = config.modResults;
    const mainGroup = project.getFirstProject().firstProject.mainGroup;

    let resourcesGroup = project.pbxGroupByName('Resources');
    if (!resourcesGroup) {
      resourcesGroup = project.addPbxGroup([], 'Resources', 'Resources');
      project.addToPbxGroup(resourcesGroup.uuid, mainGroup);
    }

    project.addResourceFile(blastedImageDir, { target: project.getFirstTarget().uuid }, resourcesGroup.uuid);

    return config;
  });

  return config;
};

module.exports = blastedAssets;
