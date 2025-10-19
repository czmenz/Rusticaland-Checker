const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Admin přístup
  getAdminStatus: () => ipcRenderer.invoke('get-admin-status'),
  
  // Window controls
  closeApp: () => ipcRenderer.invoke('close-app'),
  
  // Registry operations
  getRegistryValue: (keyPath, valueName) => ipcRenderer.invoke('get-registry-value', keyPath, valueName),
  
  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  readFileBuffer: (filePath) => ipcRenderer.invoke('read-file-buffer', filePath),
  
  // System info
  getComputerName: () => ipcRenderer.invoke('get-computer-name'),
  
  // Logging
  writeLog: (message) => ipcRenderer.invoke('write-log', message),
  
  // PC Security Check operations
  checkService: (serviceName) => ipcRenderer.invoke('check-service', serviceName),
  checkDefenderTamperProtection: () => ipcRenderer.invoke('check-defender-tamper-protection'),
  checkEasyAntiCheat: () => ipcRenderer.invoke('check-easy-anticheat'),
  backupEventLogs: () => ipcRenderer.invoke('backup-event-logs'),
  backupEACLogs: () => ipcRenderer.invoke('backup-eac-logs'),
  
  // Suspicious Files Check operations
  getAllDrives: () => ipcRenderer.invoke('get-all-drives'),
  scanDirectory: (dirPath) => ipcRenderer.invoke('scan-directory', dirPath),
  scanRecycleBin: () => ipcRenderer.invoke('scan-recycle-bin'),
  getRecycleBinCleanupTime: () => ipcRenderer.invoke('get-recycle-bin-cleanup-time'),
  getRecentUSBDrives: () => ipcRenderer.invoke('get-recent-usb-drives'),
  getFileStats: (filePath) => ipcRenderer.invoke('get-file-stats', filePath),
  checkFileSignature: (filePath) => ipcRenderer.invoke('check-file-signature', filePath),
  
  // Event listenery
  onAdminStatus: (callback) => ipcRenderer.on('admin-status', callback),
  removeAdminStatusListener: (callback) => ipcRenderer.removeListener('admin-status', callback)
});