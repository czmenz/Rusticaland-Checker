const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;

// Logging function to write to log.log file
function writeToLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  try {
    const logPath = path.join(__dirname, 'log.log');
    fs.appendFileSync(logPath, logMessage);
    console.log(message); // Also log to console
  } catch (error) {
    console.error('Failed to write to log file:', error);
    console.log(message); // Fallback to console only
  }
}


// USB detection removed as requested

// Get last recycle bin cleanup time from Windows registry
ipcMain.handle('get-recycle-bin-cleanup-time', async () => {
  try {
    return new Promise((resolve) => {
      // Try to get the last empty recycle bin time from registry
      const regQuery = spawn('reg', [
        'query',
        'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\BitBucket',
        '/v',
        'LastEmptyTime',
        '/t',
        'REG_QWORD'
      ], { shell: true });

      let output = '';
      let error = '';

      regQuery.stdout.on('data', (data) => {
        output += data.toString();
      });

      regQuery.stderr.on('data', (data) => {
        error += data.toString();
      });

      regQuery.on('close', (code) => {
        if (code === 0 && output.includes('LastEmptyTime')) {
          try {
            // Extract the timestamp from registry output
            const match = output.match(/LastEmptyTime\s+REG_QWORD\s+0x([0-9a-fA-F]+)/);
            if (match) {
              const hexValue = match[1];
              // Convert Windows FILETIME to JavaScript Date
              const filetime = parseInt(hexValue, 16);
              const jsTime = (filetime / 10000) - 11644473600000; // Convert to JS timestamp
              const date = new Date(jsTime);
              resolve(date.toISOString());
              return;
            }
          } catch (parseError) {
            writeToLog(`Error parsing registry timestamp: ${parseError.message}`);
          }
        }
        
        // Fallback: try to get from event logs
        const eventLogQuery = spawn('wevtutil', [
          'qe',
          'System',
          '/q:"*[System[Provider[@Name=\'Microsoft-Windows-Shell-Core\'] and EventID=12289]]"',
          '/c:1',
          '/rd:true',
          '/f:text'
        ], { shell: true });

        let eventOutput = '';
        
        eventLogQuery.stdout.on('data', (data) => {
          eventOutput += data.toString();
        });

        eventLogQuery.on('close', (eventCode) => {
          if (eventCode === 0 && eventOutput.includes('Date and Time:')) {
            try {
              const dateMatch = eventOutput.match(/Date and Time:\s+(.+)/);
              if (dateMatch) {
                const dateStr = dateMatch[1].trim();
                const date = new Date(dateStr);
                resolve(date.toISOString());
                return;
              }
            } catch (eventParseError) {
              writeToLog(`Error parsing event log date: ${eventParseError.message}`);
            }
          }
          
          // Final fallback: return current date if no cleanup found
          resolve(null);
        });
      });
    });
  } catch (error) {
    writeToLog(`Error getting recycle bin cleanup time: ${error.message}`);
    return null;
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 300,
    minWidth: 600,
    minHeight: 300,
    frame: false, // Odstraní defaultní title bar
    resizable: false,
    icon: path.join(__dirname, 'logo.jpg'), // Přidání ikony pro taskbar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: false // Zakáže dev tools v produkci
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Odstraněno automatické otevření dev tools
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Kontrola admin přístupu při spuštění
  checkAdminAccess();
}

function checkAdminAccess() {
  // Kontrola, zda aplikace běží s admin právy
  let isAdmin = false;
  
  try {
    if (process.platform === 'win32') {
      require('child_process').execSync('net session', { encoding: 'utf8', stdio: 'pipe' });
      isAdmin = true; // Pokud příkaz proběhne bez chyby, máme admin práva
    } else {
      isAdmin = process.getuid && process.getuid() === 0;
    }
  } catch (error) {
    // Pokud příkaz selže, nemáme admin práva
    isAdmin = false;
  }

  if (!isAdmin) {
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Admin přístup vyžadován',
      message: 'Tato aplikace vyžaduje spuštění s administrátorskými právy pro správnou funkci.',
      buttons: ['OK']
    });
  }

  // Odeslání stavu admin přístupu do rendereru
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('admin-status', isAdmin);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers pro komunikaci s renderem
ipcMain.handle('get-admin-status', () => {
  let isAdmin = false;
  
  try {
    if (process.platform === 'win32') {
      require('child_process').execSync('net session', { encoding: 'utf8', stdio: 'pipe' });
      isAdmin = true; // Pokud příkaz proběhne bez chyby, máme admin práva
    } else {
      isAdmin = process.getuid && process.getuid() === 0;
    }
  } catch (error) {
    // Pokud příkaz selže, nemáme admin práva
    isAdmin = false;
  }
  
  return isAdmin;
});

// Handler pro zavření aplikace
ipcMain.handle('close-app', () => {
  app.quit();
});

// Handler pro čtení z registru Windows
ipcMain.handle('get-registry-value', async (event, keyPath, valueName) => {
  try {
    if (process.platform !== 'win32') {
      throw new Error('Registry access only available on Windows');
    }
    
    const { execSync } = require('child_process');
    const command = `reg query "${keyPath}" /v "${valueName}"`;
    const output = execSync(command, { encoding: 'utf8' });
    
    // Parse the output to extract the value
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes(valueName)) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          return parts.slice(2).join(' '); // Return the value part
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Registry read error:', error);
    return null;
  }
});

// Handler pro čtení souborů
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('File read error:', error);
    throw error;
  }
});

// Handler pro získání názvu počítače
ipcMain.handle('get-computer-name', () => {
  return os.hostname();
});

// Handler pro logování do souboru
ipcMain.handle('write-log', async (event, message) => {
  try {
    const logPath = path.join(process.cwd(), 'log.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(logPath, logEntry, 'utf8');
    writeToLog('Log written: ' + message);
    return true;
  } catch (error) {
    writeToLog('Log write error: ' + error.message);
    return false;
  }
});

// Handler pro kontrolu služeb
ipcMain.handle('check-service', async (event, serviceName) => {
  return new Promise((resolve) => {
    const command = `sc query "${serviceName}"`;
    const child = spawn('cmd', ['/c', command], { shell: true });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0 && output.includes('RUNNING')) {
        resolve('Running');
      } else if (code === 0 && output.includes('STOPPED')) {
        resolve('Stopped');
      } else if (error.includes('does not exist') || error.includes('specified service does not exist')) {
        resolve('Not Found');
      } else {
        resolve('Unknown');
      }
    });
  });
});

// Handler pro kontrolu Defender Tamper Protection
ipcMain.handle('check-defender-tamper-protection', async () => {
  return new Promise((resolve) => {
    const command = 'Get-MpComputerStatus | Select-Object -ExpandProperty IsTamperProtected';
    const child = spawn('powershell', ['-Command', command], { shell: true });
    
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (output.trim() === 'True') {
        resolve('Enabled');
      } else if (output.trim() === 'False') {
        resolve('Disabled');
      } else {
        resolve('Unknown');
      }
    });
  });
});

// Handler pro kontrolu Easy Anti-Cheat
ipcMain.handle('check-easy-anticheat', async () => {
  const eacPaths = [
    'C:\\Program Files (x86)\\EasyAntiCheat',
    'C:\\Program Files\\EasyAntiCheat'
  ];
  
  for (const eacPath of eacPaths) {
    if (fs.existsSync(eacPath)) {
      return 'Installed';
    }
  }
  
  return 'Not Found';
});

// Handler pro backup event logů
ipcMain.handle('backup-event-logs', async () => {
  return new Promise((resolve) => {
    const backupDir = path.join(process.cwd(), 'event_logs_backup');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logTypes = ['System', 'Application', 'Security'];
    const backupPaths = [];
    
    let completed = 0;
    
    logTypes.forEach((logType) => {
      const outputFile = path.join(backupDir, `${logType}_${timestamp}.evtx`);
      const command = `wevtutil epl ${logType} "${outputFile}"`;
      
      const child = spawn('cmd', ['/c', command], { shell: true });
      
      child.on('close', (code) => {
        if (code === 0) {
          backupPaths.push(outputFile);
        }
        completed++;
        
        if (completed === logTypes.length) {
          resolve(backupPaths);
        }
      });
    });
  });
});

// Handler pro backup EAC logů
ipcMain.handle('backup-eac-logs', async () => {
  const eacLogPaths = [
    path.join(os.homedir(), 'AppData', 'Roaming', 'EasyAntiCheat'),
    'C:\\Program Files (x86)\\EasyAntiCheat\\Logs',
    'C:\\Program Files\\EasyAntiCheat\\Logs'
  ];
  
  const backupDir = path.join(process.cwd(), 'eac_logs_backup');
  const backupPaths = [];
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  for (const logPath of eacLogPaths) {
    if (fs.existsSync(logPath)) {
      try {
        const files = fs.readdirSync(logPath);
        files.forEach((file) => {
          if (file.endsWith('.log') || file.endsWith('.txt')) {
            const sourcePath = path.join(logPath, file);
            const destPath = path.join(backupDir, file);
            fs.copyFileSync(sourcePath, destPath);
            backupPaths.push(destPath);
          }
        });
      } catch (error) {
        console.error(`Error backing up EAC logs from ${logPath}:`, error);
      }
    }
  }
  
  return backupPaths;
});

// Suspicious Files Check handlers
ipcMain.handle('get-all-drives', async () => {
  try {
    const drives = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (const letter of letters) {
      const drivePath = `${letter}:\\`;
      try {
        await fs.promises.access(drivePath);
        drives.push(drivePath);
      } catch (error) {
        // Drive doesn't exist or is not accessible
      }
    }
    
    return drives;
  } catch (error) {
    console.error('Error getting drives:', error);
    return [];
  }
});

ipcMain.handle('scan-directory', async (event, dirPath) => {
  try {
    writeToLog(`Starting scan of directory: ${dirPath}`);
    const files = [];
    const { Worker } = require('worker_threads');
    const numCPUs = require('os').cpus().length;
    const maxWorkers = Math.min(numCPUs, 4); // Limit to 4 workers max
    
    // Check if directory is accessible
    try {
      await fs.promises.access(dirPath, fs.constants.R_OK);
      writeToLog(`Directory ${dirPath} is accessible`);
    } catch (error) {
      writeToLog(`Directory ${dirPath} is not accessible: ${error.message}`);
      return [];
    }
    
    // Get all directories first
    const directories = [];
    
    const getDirectories = async (currentPath) => {
      try {
        const items = await fs.promises.readdir(currentPath, { withFileTypes: true });
        writeToLog(`Found ${items.length} items in ${currentPath}`);
        
        for (const item of items) {
          if (item.isDirectory()) {
            const fullPath = path.join(currentPath, item.name);
            
            // Skip system directories that are likely to be large and not contain cheats
            const dirName = item.name.toLowerCase();
            if (dirName === 'windows' || dirName === 'program files' || 
                dirName === 'program files (x86)' || dirName === 'programdata' ||
                dirName === 'system volume information' || dirName === '$recycle.bin' ||
                dirName === 'winsxs') {
              writeToLog(`Skipping system directory: ${fullPath}`);
              continue;
            }
            
            directories.push(fullPath);
            try {
              await getDirectories(fullPath);
            } catch (error) {
              writeToLog(`Cannot access subdirectory ${fullPath}: ${error.message}`);
              // Continue even if we can't access some directories
            }
          }
        }
      } catch (error) {
        writeToLog(`Cannot read directory ${currentPath}: ${error.message}`);
        // Continue scanning even if we can't access some directories
      }
    };
    
    // First scan the root directory for files
    try {
      const rootItems = await fs.promises.readdir(dirPath, { withFileTypes: true });
      writeToLog(`Found ${rootItems.length} items in root directory ${dirPath}`);
      for (const item of rootItems) {
        if (item.isFile() && path.extname(item.name).toLowerCase() === '.exe') {
          const filePath = path.join(dirPath, item.name);
          files.push(filePath);
          writeToLog(`Found .exe file in root: ${filePath}`);
        }
      }
    } catch (error) {
      writeToLog(`Cannot scan root directory ${dirPath}: ${error.message}`);
    }
    
    // Get all directories
    await getDirectories(dirPath);
    writeToLog(`Total directories found: ${directories.length}`);
    
    // Process directories in batches using workers
    const batchSize = Math.ceil(directories.length / maxWorkers);
    const workers = [];
    const promises = [];
    
    for (let i = 0; i < maxWorkers && i * batchSize < directories.length; i++) {
      const batch = directories.slice(i * batchSize, (i + 1) * batchSize);
      
      if (batch.length > 0) {
        writeToLog(`Processing batch ${i + 1} with ${batch.length} directories`);
        const promise = new Promise((resolve, reject) => {
          // Use synchronous scanning for each batch to avoid worker thread complexity
          const scanBatch = async () => {
            const batchFiles = [];
            
            for (const dir of batch) {
              try {
                const items = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const item of items) {
                  if (item.isFile() && path.extname(item.name).toLowerCase() === '.exe') {
                    const filePath = path.join(dir, item.name);
                    batchFiles.push(filePath);
                    writeToLog(`Found .exe file: ${filePath}`);
                  }
                }
              } catch (error) {
                writeToLog(`Cannot access directory ${dir}: ${error.message}`);
                // Continue even if we can't access some directories
              }
            }
            
            return batchFiles;
          };
          
          scanBatch().then(resolve).catch(reject);
        });
        
        promises.push(promise);
      }
    }
    
    // Wait for all batches to complete
    const results = await Promise.all(promises);
    
    // Combine all results
    for (const batchFiles of results) {
      files.push(...batchFiles);
    }
    
    writeToLog(`Total .exe files found in ${dirPath}: ${files.length}`);
    return files;
  } catch (error) {
    writeToLog('Error scanning directory: ' + error.message);
    return [];
  }
});

ipcMain.handle('get-file-stats', async (event, filePath) => {
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    console.error('Error getting file stats:', error);
    return null;
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
});

// Add function to read file // Handler pro čtení souboru jako buffer
ipcMain.handle('read-file-buffer', async (event, filePath) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    return buffer;
  } catch (error) {
    console.error('Error reading file as buffer:', error);
    return null;
  }
});

ipcMain.handle('scan-recycle-bin', async () => {
  try {
    const recycleFiles = [];
    const drives = ['C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:', 'N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:'];
    
    // Helper function to read original filename from $I file
    const getOriginalFilename = async (iFilePath) => {
      try {
        const buffer = await fs.promises.readFile(iFilePath);
        // Original filename starts at offset 24 (0x18) and is UTF-16LE encoded
        // First, find the length of the filename (4 bytes at offset 20)
        const filenameLength = buffer.readUInt32LE(20);
        if (filenameLength > 0 && filenameLength < 1000) { // Sanity check
          const filenameBuffer = buffer.slice(24, 24 + (filenameLength * 2));
          return filenameBuffer.toString('utf16le').replace(/\0/g, '');
        }
      } catch (error) {
        // If we can't read the original filename, return null
      }
      return null;
    };
    
    for (const drive of drives) {
      const recyclePath = path.join(drive, '\\', '$Recycle.Bin');
      
      try {
        await fs.promises.access(recyclePath);
        
        // Scan all subdirectories in Recycle Bin
        const recycleDirs = await fs.promises.readdir(recyclePath, { withFileTypes: true });
        
        for (const dir of recycleDirs) {
          if (dir.isDirectory()) {
            const userRecyclePath = path.join(recyclePath, dir.name);
            
            try {
              const recycleItems = await fs.promises.readdir(userRecyclePath, { withFileTypes: true });
              
              for (const item of recycleItems) {
                if (item.isFile() && item.name.startsWith('$I')) {
                  const iFilePath = path.join(userRecyclePath, item.name);
                  const rFileName = item.name.replace('$I', '$R');
                  const rFilePath = path.join(userRecyclePath, rFileName);
                  
                  try {
                    const iStats = await fs.promises.stat(iFilePath);
                    let fileSize = iStats.size;
                    let displayName = item.name;
                    
                    // Try to get original filename from $I file
                    const originalName = await getOriginalFilename(iFilePath);
                    if (originalName) {
                      displayName = originalName;
                    }
                    
                    // Try to get size from corresponding $R file if it exists
                    try {
                      const rStats = await fs.promises.stat(rFilePath);
                      fileSize = rStats.size;
                    } catch (rError) {
                      // $R file doesn't exist, use $I file size
                    }
                    
                    recycleFiles.push({
                      path: iFilePath,
                      name: displayName,
                      size: fileSize,
                      deleted: iStats.mtime,
                      drive: drive
                    });
                  } catch (statError) {
                    // Continue if we can't get file stats
                  }
                }
              }
            } catch (userDirError) {
              // Continue if we can't access user recycle directory
            }
          }
        }
      } catch (driveError) {
        // Drive doesn't have recycle bin or is not accessible
      }
    }
    
    return recycleFiles;
  } catch (error) {
    console.error('Error scanning recycle bin:', error);
    return [];
  }
});

// Handler pro kontrolu metadat souboru (autorská práva, verze produktu atd.)
ipcMain.handle('check-file-signature', async (event, filePath) => {
  return new Promise((resolve) => {
    // PowerShell příkaz pro získání metadat souboru
    const command = `
      try {
        $file = Get-Item -LiteralPath "${filePath}" -ErrorAction Stop;
        $versionInfo = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($file.FullName);
        
        $result = @{
          HasCopyright = ![string]::IsNullOrWhiteSpace($versionInfo.LegalCopyright);
          HasProductVersion = ![string]::IsNullOrWhiteSpace($versionInfo.ProductVersion);
          HasFileVersion = ![string]::IsNullOrWhiteSpace($versionInfo.FileVersion);
          HasCompanyName = ![string]::IsNullOrWhiteSpace($versionInfo.CompanyName);
          HasProductName = ![string]::IsNullOrWhiteSpace($versionInfo.ProductName);
          Copyright = $versionInfo.LegalCopyright;
          ProductVersion = $versionInfo.ProductVersion;
          FileVersion = $versionInfo.FileVersion;
          CompanyName = $versionInfo.CompanyName;
          ProductName = $versionInfo.ProductName;
        };
        
        $result | ConvertTo-Json -Compress;
      } catch {
        @{ Error = $_.Exception.Message } | ConvertTo-Json -Compress;
      }
    `;
    
    const child = spawn('powershell', ['-Command', command], { shell: true });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      try {
        if (error || code !== 0) {
          resolve({ 
            signed: false, 
            publisher: null, 
            status: 'Error',
            hasMetadata: false,
            reason: 'Failed to get file metadata'
          });
          return;
        }
        
        // Parsování JSON výstupu
        const jsonOutput = output.trim();
        if (!jsonOutput) {
          resolve({ 
            signed: false, 
            publisher: null, 
            status: 'NoOutput',
            hasMetadata: false,
            reason: 'No metadata output'
          });
          return;
        }
        
        const result = JSON.parse(jsonOutput);
        
        if (result.Error) {
          resolve({ 
            signed: false, 
            publisher: null, 
            status: 'Error',
            hasMetadata: false,
            reason: result.Error
          });
          return;
        }
        
        // Kontrola, zda má soubor alespoň jedno z důležitých metadat
        const hasMetadata = result.HasCopyright || result.HasProductVersion || 
                           result.HasFileVersion || result.HasCompanyName || 
                           result.HasProductName;
        
        const isMicrosoft = result.CompanyName && (
          result.CompanyName.toLowerCase().includes('microsoft') ||
          result.CompanyName.toLowerCase().includes('windows')
        );
        
        resolve({
          signed: hasMetadata, // Považujeme za "podepsané" pokud má metadata
          publisher: result.CompanyName || result.ProductName || null,
          status: hasMetadata ? 'Valid' : 'NotSigned',
          isMicrosoft: isMicrosoft,
          hasMetadata: hasMetadata,
          metadata: {
            copyright: result.Copyright,
            productVersion: result.ProductVersion,
            fileVersion: result.FileVersion,
            companyName: result.CompanyName,
            productName: result.ProductName
          },
          reason: hasMetadata ? 'Has file metadata' : 'Missing file metadata (copyright, version, company info)'
        });
      } catch (parseError) {
        console.error('Error parsing metadata result:', parseError, 'Output:', output);
        resolve({ 
          signed: false, 
          publisher: null, 
          status: 'ParseError',
          hasMetadata: false,
          reason: 'Failed to parse metadata'
        });
      }
    });
  });
});