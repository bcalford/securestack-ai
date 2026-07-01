package com.securestack.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "securestack.scan")
public class ScanProperties {
    private int maxFileSizeMb = 2;
    private int maxScanFiles = 50;
    private boolean storeRawFiles = false;
    private int maxGithubDownloadSizeMb = 10;

    public int getMaxFileSizeMb() { return maxFileSizeMb; }
    public void setMaxFileSizeMb(int maxFileSizeMb) { this.maxFileSizeMb = maxFileSizeMb; }
    public int getMaxScanFiles() { return maxScanFiles; }
    public void setMaxScanFiles(int maxScanFiles) { this.maxScanFiles = maxScanFiles; }
    public boolean isStoreRawFiles() { return storeRawFiles; }
    public void setStoreRawFiles(boolean storeRawFiles) { this.storeRawFiles = storeRawFiles; }
    public int getMaxGithubDownloadSizeMb() { return maxGithubDownloadSizeMb; }
    public void setMaxGithubDownloadSizeMb(int maxGithubDownloadSizeMb) { this.maxGithubDownloadSizeMb = maxGithubDownloadSizeMb; }
}
