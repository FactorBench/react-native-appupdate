'use strict';

import {
  NativeModules,
  Platform,
} from 'react-native';

import CompareVersions from 'compare-versions';

const RNAppUpdate = NativeModules.RNAppUpdate;

const jobId = -1;

class AppUpdate {
  constructor(options) {
    this.options = options;
  }

  GET(url, success, error) {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        success && success(json);
      })
      .catch((err) => {
        error && error(err);
      });
  }

  getPlayMarketVersion() {
    if (jobId !== -1) {
      return;
    }
    if (!this.options.apkVersionUrl) {
      console.log("apkVersionUrl doesn't exist.");
      return;
    }
    this.GET(this.options.apkVersionUrl, this.getPlayMarketVersionSuccess.bind(this), this.getVersionError.bind(this));
  }

  getPlayMarketVersionSuccess(remote) {
    console.log("getPlayMarketVersionSuccess", remote);
    if (CompareVersions(remote.versionName, RNAppUpdate.versionName) > 0) {
      if (this.options.needUpdateApp) {
        this.options.needUpdateApp((isUpdate) => {
          if (isUpdate) {
            // TODO: install from play market
          }
        });
      }
    }
  }

  getAppStoreVersion() {
    if (!this.options.iosAppId) {
      console.log("iosAppId doesn't exist.");
      return;
    }
    this.GET("https://itunes.apple.com/lookup?id=" + this.options.iosAppId, this.getAppStoreVersionSuccess.bind(this), this.getVersionError.bind(this));
  }

  getAppStoreVersionSuccess(data) {
    if (data.resultCount < 1) {
      console.log("iosAppId is wrong.");
      return;
    }
    const result = data.results[0];
    const version = result.version;
    const trackViewUrl = result.trackViewUrl;
    if (CompareVersions(version, RNAppUpdate.versionName) > 0) {
      if (this.options.needUpdateApp) {
        this.options.needUpdateApp((isUpdate) => {
          if (isUpdate) {
            RNAppUpdate.installFromAppStore(trackViewUrl);
          }
        });
      }
    }
  }

  getVersionError(err) {
    console.log("getVersionError", err);
  }

  checkUpdate() {
    if (Platform.OS === 'android') {
      this.getPlayMarketVersion();
    } else {
      this.getAppStoreVersion();
    }
  }
}

export default AppUpdate;
