/**
 * RAM tracking utilities
 */

// Estimating 120MB per tab (a conservative estimate for modern web apps)
export const ESTIMATED_MB_PER_TAB = 120;

export interface RamInfo {
  estimatedTabMb: number;
  systemTotalMb: number;
  systemAvailableMb: number;
  isPressureHigh: boolean;
  message: string;
}

export async function getRamInfo(): Promise<RamInfo> {
  // 1. Get tab count
  const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({}, (res) => resolve(res || []));
  });
  // Filter out discarded and suspended tabs
  let activeTabCount = 0;
  for (const tab of tabs) {
    if (tab.discarded) continue;
    // Many tab suspenders redirect the tab to a local extension page
    if (tab.url?.startsWith('chrome-extension://')) continue;
    activeTabCount++;
  }
  const suspendedCount = tabs.length - activeTabCount;
  
  const estimatedTabMb = activeTabCount * ESTIMATED_MB_PER_TAB;

  // 2. Get system memory if available
  let systemTotalMb = 0;
  let systemAvailableMb = 0;
  
  try {
    if (chrome.system && chrome.system.memory) {
      const memInfo = await new Promise<chrome.system.memory.MemoryInfo>((resolve) => {
        chrome.system.memory.getInfo((info) => resolve(info));
      });
      // Convert bytes to MB
      systemTotalMb = Math.round(memInfo.capacity / (1024 * 1024));
      systemAvailableMb = Math.round(memInfo.availableCapacity / (1024 * 1024));
    }
  } catch (err) {
    console.warn("Could not fetch system memory:", err);
  }

  // Determine pressure
  let isPressureHigh = false;
  if (systemTotalMb > 0) {
    const usageRatio = estimatedTabMb / systemTotalMb;
    // High pressure if active tabs are eating more than 40% of total system RAM
    if (usageRatio > 0.4 || systemAvailableMb < 1000) {
      isPressureHigh = true;
    }
  } else if (estimatedTabMb > 4000) {
    // Fallback: > 4GB of tab RAM is pressure
    isPressureHigh = true;
  }

  // Generate message
  const suspendedText = suspendedCount > 0 ? ` (and ${suspendedCount} suspended)` : '';
  let message = "";
  if (isPressureHigh) {
    message = `Your ${activeTabCount} active tabs${suspendedText} are eating ~${(estimatedTabMb / 1024).toFixed(1)}GB of RAM. Your system is literally gasping for air.`;
  } else {
    message = `Your ${activeTabCount} active tabs${suspendedText} are eating ~${(estimatedTabMb / 1024).toFixed(1)}GB of RAM.`;
  }

  return {
    estimatedTabMb,
    systemTotalMb,
    systemAvailableMb,
    isPressureHigh,
    message
  };
}
