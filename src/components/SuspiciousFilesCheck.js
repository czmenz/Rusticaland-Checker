import React, { useState } from 'react';

const SuspiciousFilesCheck = ({ onComplete, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState('');

  // Patterns for suspicious files
  const suspiciousPatterns = {
    // Random alphanumeric names (improved pattern - at least 10 characters)
    randomAlphanumeric: /^[A-Za-z0-9]{10,}\.exe$/i,
    
    // Specific suspicious names
    specificNames: ['dControl.exe', 'loader.exe', 'ProcessHacker.exe'],
    
    // Suspicious name parts (excluding anticheat software)
    suspiciousNameParts: ['cheat', 'hack', 'rustiris', 'omega', 'injector', 'dcontrol', 'loader', 'iris'],
    
    // Anticheat exclusions (these should NOT be flagged)
    anticheatExclusions: ['anticheat', 'eac', 'battleye', 'vanguard', 'faceit'],
    
    // Suspicious paths (temp folders, user profiles instead of Program Files)
    suspiciousPaths: [
      /\\AppData\\Local\\Temp\\/i,
      /\\Windows\\Temp\\/i,
      /\\Users\\[^\\]+\\Desktop\\/i,
      /\\Users\\[^\\]+\\Documents\\/i,
      /\\Users\\[^\\]+\\Downloads\\/i,
      /\\Users\\[^\\]+\\Pictures\\/i,
      /\\Users\\[^\\]+\\Videos\\/i,
      /\\Users\\[^\\]+\\Music\\/i
    ],
    
    // Unusual extensions in user folders
    unusualExtensions: ['.dll', '.sys', '.ocx', '.scr'],
    
    // Executable extensions
    executableExtensions: ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar']
  };

  const isRandomAlphanumeric = (filename) => {
    return suspiciousPatterns.randomAlphanumeric.test(filename);
  };

  const isSpecificSuspiciousName = (filename) => {
    return suspiciousPatterns.specificNames.some(name => 
      filename.toLowerCase() === name.toLowerCase()
    );
  };

  const containsSuspiciousNamePart = (filename) => {
    const lowerFilename = filename.toLowerCase();
    
    // First check if it's an anticheat software (should NOT be flagged)
    const isAnticheat = suspiciousPatterns.anticheatExclusions.some(exclusion => 
      lowerFilename.includes(exclusion.toLowerCase())
    );
    
    if (isAnticheat) {
      return false; // Don't flag anticheat software
    }
    
    // Then check for suspicious parts
    return suspiciousPatterns.suspiciousNameParts.some(part => 
      lowerFilename.includes(part.toLowerCase())
    );
  };

  const isInSuspiciousPath = (filePath) => {
    return suspiciousPatterns.suspiciousPaths.some(pattern => 
      pattern.test(filePath)
    );
  };

  const hasUnusualExtension = (filePath) => {
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    const filename = filePath.substring(filePath.lastIndexOf('\\') + 1);
    
    // Check if it's a DLL with suspicious name parts
    if (ext === '.dll' && containsSuspiciousNamePart(filename)) {
      return true;
    }
    
    return suspiciousPatterns.unusualExtensions.includes(ext) && 
           isInUserFolder(filePath);
  };

  const isInUserFolder = (filePath) => {
    return /\\Users\\[^\\]+\\/i.test(filePath);
  };

  const isExecutableOutsideStandardPaths = (filePath) => {
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    const isExecutable = suspiciousPatterns.executableExtensions.includes(ext);
    
    if (!isExecutable) return false;
    
    // Check if it's in standard paths
    const standardPaths = [
      /\\Program Files\\/i,
      /\\Program Files \(x86\)\\/i,
      /\\Windows\\System32\\/i,
      /\\Windows\\SysWOW64\\/i
    ];
    
    const isInStandardPath = standardPaths.some(pattern => pattern.test(filePath));
    return !isInStandardPath;
  };

  const analyzeSuspiciousFile = (filePath) => {
    const filename = filePath.substring(filePath.lastIndexOf('\\') + 1);
    const reasons = [];

    if (isRandomAlphanumeric(filename)) {
      reasons.push('Random alphanumeric name');
    }

    if (isSpecificSuspiciousName(filename)) {
      reasons.push('Known suspicious filename (dControl.exe)');
    }

    if (containsSuspiciousNamePart(filename)) {
      reasons.push('Contains suspicious name part (cheat/hack/rustiris/omega)');
    }

    if (isInSuspiciousPath(filePath)) {
      reasons.push('Located in suspicious path (Temp/User folders)');
    }

    if (hasUnusualExtension(filePath)) {
      const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      const filename = filePath.substring(filePath.lastIndexOf('\\') + 1);
      
      if (ext === '.dll' && containsSuspiciousNamePart(filename)) {
        reasons.push('Suspicious DLL with suspicious name part (cheat/hack/rustiris/omega)');
      } else {
        reasons.push('Unusual extension in user folder');
      }
    }

    if (isExecutableOutsideStandardPaths(filePath)) {
      reasons.push('Executable outside standard paths');
    }

    return reasons;
  };

  const performSuspiciousFilesCheck = async () => {
    setIsScanning(true);
    setProgress('Getting list of drives...');
    
    try {
      const suspiciousFiles = [];
      
      // Get all drives
      const drives = await window.electronAPI.getAllDrives();
      console.log('Found drives:', drives);
      
      for (const drive of drives) {
        setProgress(`Scanning drive ${drive}...`);
        
        try {
          // Scan each drive
          const files = await window.electronAPI.scanDirectory(drive);
          console.log(`Found ${files.length} files on ${drive}`);
          
          // Analyze each file
          for (const filePath of files) {
            const reasons = analyzeSuspiciousFile(filePath);
            
            if (reasons.length > 0) {
              try {
                const stats = await window.electronAPI.getFileStats(filePath);
                suspiciousFiles.push({
                  path: filePath,
                  reasons: reasons,
                  stats: stats,
                  filename: filePath.substring(filePath.lastIndexOf('\\') + 1)
                });
              } catch (error) {
                // If we can't get stats, still add the file
                suspiciousFiles.push({
                  path: filePath,
                  reasons: reasons,
                  stats: null,
                  filename: filePath.substring(filePath.lastIndexOf('\\') + 1)
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error scanning drive ${drive}:`, error);
        }
      }

      // Generate report
      setProgress('Generating report...');
      const reportContent = generateReport(suspiciousFiles);
      
      // Save report to file
      const reportPath = 'Suspicious-files.txt';
      await window.electronAPI.writeFile(reportPath, reportContent);
      
      // Get recently accessed/created files for Discord embed
      const recentFiles = getRecentFiles(suspiciousFiles);
      
      // Detect possible cheats
      const possibleCheats = detectPossibleCheats(suspiciousFiles);
      
      setProgress('Completed!');
      
      const results = {
        totalFiles: suspiciousFiles.length,
        suspiciousFiles: suspiciousFiles,
        recentlyOpened: recentFiles.recentlyOpened,
        recentlyDownloaded: recentFiles.recentlyDownloaded,
        possibleCheats: possibleCheats,
        reportPath: reportPath
      };

      if (onComplete) {
        onComplete(results);
      }
      
    } catch (error) {
      console.error('Error during suspicious files check:', error);
      setProgress('Error during scanning!');
      if (onError) {
        onError(error);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const generateReport = (suspiciousFiles) => {
    let report = `SUSPICIOUS FILES REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Total suspicious files found: ${suspiciousFiles.length}\n\n`;
    report += `${'='.repeat(80)}\n\n`;

    suspiciousFiles.forEach((file, index) => {
      report += `${index + 1}. ${file.path}\n`;
      report += `   Filename: ${file.filename}\n`;
      report += `   Reasons: ${file.reasons.join(', ')}\n`;
      
      if (file.stats) {
        report += `   Size: ${file.stats.size} bytes\n`;
        report += `   Created: ${new Date(file.stats.created).toLocaleString()}\n`;
        report += `   Modified: ${new Date(file.stats.modified).toLocaleString()}\n`;
        report += `   Last Accessed: ${new Date(file.stats.accessed).toLocaleString()}\n`;
      }
      
      report += `\n${'-'.repeat(80)}\n\n`;
    });

    return report;
  };

  const detectPossibleCheats = (suspiciousFiles) => {
    const knownCheats = [
      { name: 'Omegacheat', keywords: ['omega'], sizes: [17016320] },
      { name: 'Revolex NRS', keywords: ['revolex', 'nrs'], sizes: [] },
      { name: 'DControl', keywords: ['dcontrol'], sizes: [] },
      { name: 'Rustiris', keywords: ['rustiris', 'irsis'], sizes: [] },
      { name: 'Unknown Loader', keywords: ['loader'], sizes: [] },
      { name: 'Unknown Cheat', keywords: ['cheat', 'hack', 'injector'], sizes: [] }
    ];

    const detectedCheats = [];

    suspiciousFiles.forEach(file => {
      const filename = (file.filename || '').toLowerCase();
      
      knownCheats.forEach(cheat => {
        const keywordMatch = cheat.keywords.some(keyword => filename.includes(keyword));
        const sizeMatch = cheat.sizes.length > 0 && file.stats && 
                         cheat.sizes.some(size => Math.abs(file.stats.size - size) <= 1024);
        
        if (keywordMatch || sizeMatch) {
          const existingCheat = detectedCheats.find(detected => detected.cheatName === cheat.name);
          if (!existingCheat) {
            detectedCheats.push({
              cheatName: cheat.name,
              filename: file.filename,
              path: file.path,
              detectionReason: keywordMatch ? 'Name pattern' : 'File size'
            });
          }
        }
      });
    });

    return detectedCheats;
  };

  const getRecentFiles = (suspiciousFiles) => {
    // Sort by access time for recently opened (accessed is correct for last opened)
    const recentlyOpened = suspiciousFiles
      .filter(file => file.stats && file.stats.accessed)
      .sort((a, b) => new Date(b.stats.accessed) - new Date(a.stats.accessed))
      .slice(0, 5)
      .map(file => ({
        filename: file.filename,
        date: new Date(file.stats.accessed).toLocaleDateString('cs-CZ')
      }));

    // Sort by creation time for recently downloaded (assuming creation time = download time)
    const recentlyDownloaded = suspiciousFiles
      .filter(file => file.stats && file.stats.created)
      .sort((a, b) => new Date(b.stats.created) - new Date(a.stats.created))
      .slice(0, 5)
      .map(file => ({
        filename: file.filename,
        date: new Date(file.stats.created).toLocaleDateString('cs-CZ')
      }));

    return { recentlyOpened, recentlyDownloaded };
  };

  return (
    <div className="suspicious-files-check">
      <h3>Suspicious Files Check</h3>
      {isScanning ? (
        <div>
          <p>Scanning suspicious files...</p>
          <p>{progress}</p>
        </div>
      ) : (
        <button onClick={performSuspiciousFilesCheck}>
          Start suspicious files check
        </button>
      )}
    </div>
  );
};

export default SuspiciousFilesCheck;