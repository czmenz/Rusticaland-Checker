import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import SteamDetection from './components/SteamDetection';
import PCSecurityCheck from './components/PCSecurityCheck';
import SuspiciousFilesCheck from './components/SuspiciousFilesCheck';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #00446E, #0166A6);
  display: flex;
  flex-direction: column;
  position: relative;
`;

const TopBar = styled.div`
  width: 600px;
  height: 25px;
  background: linear-gradient(to right, #002D48, #01629F, #002D48);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  -webkit-app-region: drag;
`;

const TopBarTitle = styled.div`
  font-family: 'Rubik', sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: white;
  -webkit-app-region: no-drag;
`;

const CloseButton = styled.button`
  width: 15px;
  height: 15px;
  background: transparent;
  border: none;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: no-drag;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const BottomBar = styled.div`
  width: 600px;
  height: 22px;
  background: linear-gradient(to right, #002D48, #01629F, #002D48);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
`;

const VersionText = styled.div`
  font-family: 'Rubik', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`;

// Loading animace
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(1, 102, 166, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(1, 102, 166, 0.8), 0 0 60px rgba(0, 68, 110, 0.4);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
`;

const LoadingSpinner = styled.div`
  width: 120px;
  height: 120px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top: 3px solid #0166A6;
    border-right: 3px solid #00446E;
    border-radius: 50%;
    animation: ${spin} 2s linear infinite, ${glow} 3s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 15px;
    width: 90px;
    height: 90px;
    border: 2px solid transparent;
    border-top: 2px solid rgba(1, 102, 166, 0.7);
    border-left: 2px solid rgba(0, 68, 110, 0.7);
    border-radius: 50%;
    animation: ${spin} 1.5s linear infinite reverse;
  }
`;

const LoadingDots = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 8px;
  
  &::before,
  &::after {
    content: '';
    width: 8px;
    height: 8px;
    background: linear-gradient(45deg, #0166A6, #00446E);
    border-radius: 50%;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
  
  &::before {
    animation-delay: 0s;
  }
  
  &::after {
    animation-delay: 0.5s;
  }
`;

const CenterDot = styled.div`
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #0166A6, #00446E);
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  animation-delay: 0.25s;
`;

const LoadingText = styled.div`
  font-family: 'Rubik', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: white;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
  min-height: 20px;
`;

const ProgressText = styled.div`
  font-family: 'Rubik', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
  text-align: center;
  text-shadow: 
    0 0 5px rgba(255, 255, 255, 0.6),
    0 0 10px rgba(255, 255, 255, 0.4),
    1px 1px 2px rgba(0, 0, 0, 0.8);
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
`;

// Styled components for authentication in main content
const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  max-width: 400px;
  margin: 0 auto;
`;

const AuthTitle = styled.h2`
  font-family: 'Rubik', sans-serif;
  font-weight: 600;
  font-size: 24px;
  color: white;
  margin-bottom: 10px;
  text-align: center;
`;

const AuthSubtitle = styled.p`
  font-family: 'Rubik', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  text-align: center;
`;

const AuthInput = styled.input`
  width: 100%;
  padding: 15px;
  font-family: 'Rubik', sans-serif;
  font-size: 14px;
  border: 2px solid #01629F;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-bottom: 10px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #0166A6;
    box-shadow: 0 0 15px rgba(1, 102, 166, 0.4);
  }
`;

const AuthButton = styled.button`
  width: 150px;
  padding: 15px;
  font-family: 'Rubik', sans-serif;
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(135deg, #01629F, #0166A6, #0180CC);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(1, 102, 166, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: linear-gradient(135deg, #0166A6, #0180CC, #01629F);
    box-shadow: 0 6px 25px rgba(1, 102, 166, 0.6);
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 15px rgba(1, 102, 166, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AuthError = styled.div`
  color: #ff6b6b;
  font-family: 'Rubik', sans-serif;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing application...');
  const [progress, setProgress] = useState(0);
  const [detectionResults, setDetectionResults] = useState(null);

  // Staff authentication keys
  const validKeys = {
    'b7g3z8x4a1t9n2r6m0q5e7c1d8h9y4k3p2u5j0s6v1l9w8f3o7i2': 'Wakka',
    'x2d9s4k1a8l0q6m7f3z5p2h9c8j1r4e0u7t6g5b3y9v2n8o1w4i7': 'Nemesis',
    'n4r2p9q8k7x1d5a0g6j4m2c9f3y8v5s0t1h7l6e9b4w3i2o5u8z7': 'Error',
    'f1c8y3l6r9m0d4t2a5g7s9v8j1p6e2b4k0q7x3n5w9i8o1u2h4z6': 'Death'
  };

  const handleAuth = () => {
    if (validKeys[authKey]) {
      setIsAuthenticated(true);
      setAuthError('');
      setIsLoading(true);
      console.log(`Authenticated as: ${validKeys[authKey]}`);
    } else {
      setAuthError('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  // Helper function to get the last recycle bin cleanup time
  const getLastRecycleBinCleanup = async (recycleFilesData) => {
    try {
      // First try to get the actual cleanup time from registry/event logs
      const cleanupTime = await window.electronAPI.getRecycleBinCleanupTime();
      if (cleanupTime) {
        const date = new Date(cleanupTime);
        return date.toLocaleDateString('cs-CZ') + ' ' + date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
      }
    } catch (error) {
      console.error('Error getting cleanup time:', error);
    }
    
    // Fallback to checking if recycle bin has files
    if (!recycleFilesData || !recycleFilesData.recycleFiles || recycleFilesData.recycleFiles.length === 0) {
      return 'Koš je prázdný - datum vymazání není k dispozici';
    }
    
    // Find the most recent deletion time
    const mostRecentDeletion = recycleFilesData.recycleFiles
      .map(file => new Date(file.deleted))
      .sort((a, b) => b - a)[0];
    
    return mostRecentDeletion.toLocaleDateString('cs-CZ') + ' ' + mostRecentDeletion.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to detect specific cheats based on file size
  const detectCheatsBySize = (suspiciousFilesData) => {
    if (!suspiciousFilesData || !suspiciousFilesData.suspiciousFiles) {
      return [];
    }

    const knownCheats = [
      { name: 'Revolex NRS', size: 45639968 },
      { name: 'OmegaCheats', size: 17016320 }
    ];

    const detectedCheats = [];

    suspiciousFilesData.suspiciousFiles.forEach(file => {
      if (file.stats && file.stats.size) {
        knownCheats.forEach(cheat => {
          // Allow for small size variations (±1KB)
          if (Math.abs(file.stats.size - cheat.size) <= 1024) {
            detectedCheats.push({
              cheatName: cheat.name,
              filename: file.filename,
              size: file.stats.size,
              path: file.path
            });
          }
        });
      }
    });

    return detectedCheats;
  };

  // Helper function to get suspicious DLL files
  const getSuspiciousDLLs = (suspiciousFilesData) => {
    if (!suspiciousFilesData || !suspiciousFilesData.suspiciousFiles) {
      return [];
    }
    
    return suspiciousFilesData.suspiciousFiles
      .filter(file => file.filename.toLowerCase().endsWith('.dll'))
      .sort((a, b) => new Date(b.stats?.created || 0) - new Date(a.stats?.created || 0))
      .slice(0, 5)
      .map(file => ({
        name: file.filename,
        date: file.stats?.created ? new Date(file.stats.created).toLocaleDateString('cs-CZ') : 'Unknown'
      }));
  };

  // Helper function to get most suspicious files (specificNames and suspiciousNameParts)
  const getMostSuspiciousFiles = (suspiciousFilesData) => {
    if (!suspiciousFilesData || !suspiciousFilesData.suspiciousFiles) {
      return [];
    }
    
    // Define high priority reasons
    const highPriorityReasons = [
      'Known suspicious filename',
      'Contains suspicious name part'
    ];
    
    return suspiciousFilesData.suspiciousFiles
      .filter(file => file.reasons.some(reason => 
        highPriorityReasons.some(priority => reason.includes(priority))
      ))
      .sort((a, b) => new Date(b.stats?.created || 0) - new Date(a.stats?.created || 0))
      .slice(0, 5)
      .map(file => ({
        name: file.filename,
        date: file.stats?.created ? new Date(file.stats.created).toLocaleDateString('cs-CZ') : 'Unknown'
      }));
  };

  // Function to calculate cheating percentage
  const calculateCheatPercentage = (detectionData, suspiciousFilesData) => {
    // Check for known cheats by size and name
    const knownCheats = [
      { name: 'Revolex NRS', size: 45639968 },
      { name: 'OmegaCheats', size: 17016320 }
    ];
    
    const hasKnownCheat = suspiciousFilesData?.files?.some(file => {
      if (file.stats && file.stats.size) {
        return knownCheats.some(cheat => {
          // Allow for small size variations (±1KB) and check name similarity
          const sizeMatch = Math.abs(file.stats.size - cheat.size) <= 1024;
          const nameMatch = file.name.toLowerCase().includes(cheat.name.toLowerCase()) ||
                           cheat.name.toLowerCase().includes(file.name.toLowerCase());
          return sizeMatch || nameMatch;
        });
      }
      return false;
    });
    
    if (hasKnownCheat) {
      return 99;
    }
    
    // Calculate based on suspicious files count
    const suspiciousCount = suspiciousFilesData?.totalFiles || 0;
    const bannedAccounts = detectionData?.accounts?.filter(acc => acc.banned).length || 0;
    
    let percentage = 0;
    
    // Add percentage based on suspicious files (max 60%)
    if (suspiciousCount > 0) {
      percentage += Math.min(suspiciousCount * 10, 60);
    }
    
    // Add percentage based on banned accounts (max 30%)
    if (bannedAccounts > 0) {
      percentage += Math.min(bannedAccounts * 15, 30);
    }
    
    return Math.min(percentage, 95); // Cap at 95% for non-hardcoded cases
  };

  // Function to create Discord webhook data based on detection results
  const createWebhookData = async (detectionData, pcSecurityData, suspiciousFilesData, recycleFilesData, computerName, checkedBy) => {
    const embed1 = {
      title: `PC Check completed! (${computerName})`,
      description: `Checked by: ${checkedBy}`,
      color: 65280
    };

    const embed2 = {
       title: "1. User Client",
       description: `**Using Steam Version:** ${detectionData?.usingSteam ? '✅' : '❌'}${detectionData?.rustOwnerName ? ` (${detectionData.rustOwnerName})` : ''}\n\n**Accounts:**`,
       color: 65525,
       fields: []
     };

    // Add account fields if accounts were found
    if (detectionData?.accounts && detectionData.accounts.length > 0) {
      detectionData.accounts.forEach(account => {
        const accountAge = account.accountAge ? `${account.accountAge} years ago` : 'Unknown';
        
        // Format banned status with days since ban if applicable
        let bannedStatus;
        if (account.banned) {
          const banDays = account.daysSinceLastBan || 0;
          bannedStatus = `✅ (${banDays} days ago)`;
        } else {
          bannedStatus = '❌';
        }
        
        const lastOnlineStatus = account.mostRecent ? '✅' : '❌';
        
        embed2.fields.push({
          name: account.personaName || 'Unknown',
          value: `**SteamID:** ${account.steamId}\n**Banned:** ${bannedStatus}\n**Last online:** ${lastOnlineStatus}\n**Account created:** ${account.accountAge || 'Unknown'}`
        });
      });
    } else {
      embed2.fields.push({
        name: "No accounts found",
        value: "> No Steam accounts detected on this system"
      });
    }

    // Create PC Security embed
    const getStatusIcon = (status) => {
      switch (status) {
        case 'Running':
        case 'Enabled':
        case 'Installed':
          return '🔄';
        case 'Stopped':
        case 'Disabled':
          return '❌';
        case 'Not Found':
        case 'Error':
        case 'Unknown':
          return '⁉️';
        default:
          return '⁉️';
      }
    };

    const embed3 = {
      title: "2. User PC",
      description: `**Event Log:** ${getStatusIcon(pcSecurityData?.services?.EventLog)}\n**Win Defender:** ${getStatusIcon(pcSecurityData?.services?.WinDefend)}\n**Firewall:** ${getStatusIcon(pcSecurityData?.services?.MpsSvc)}\n**Easy AntiCheat:** ${getStatusIcon(pcSecurityData?.services?.EasyAntiCheat)}\n**Win Update:** ${getStatusIcon(pcSecurityData?.services?.wuauserv)}\n**Security Center:** ${getStatusIcon(pcSecurityData?.services?.wscsvc)}\n**Tamper Protection:** ${getStatusIcon(pcSecurityData?.tamperProtection)}\n**Event Forwarding:** ${getStatusIcon(pcSecurityData?.services?.Wecsvc)}\n\nRunning: 🔄\nStopped: ❌\nNotFound/Error: ⁉️`,
      color: 10027263
    };

    // Create Suspicious Files embed
    const embed4 = {
      title: "3. Suspicious files",
      description: `Suspicious files can be found in\n\n\`\`\`lua\nSuspicious-files.txt\`\`\`\n\n**Most Suspicious files:**\n${getMostSuspiciousFiles(suspiciousFilesData)?.map(file => `${file.name} (${file.date})`).join('\n') || 'No highly suspicious files'}\n\n**Last Suspicious file opened:**\n${suspiciousFilesData?.recentlyOpened?.map(file => `${file.name} (${file.date})`).join('\n') || 'No recent files'}\n\n**Last Suspicious file downloaded:**\n${suspiciousFilesData?.recentlyDownloaded?.map(file => `${file.name} (${file.date})`).join('\n') || 'No recent files'}\n\n**Last Suspicious DLLS found:**\n${getSuspiciousDLLs(suspiciousFilesData)?.map(file => `${file.name} (${file.date})`).join('\n') || 'No suspicious DLLs'}\n\n**Possible Cheats based on detections:**\n${detectCheatsBySize(suspiciousFilesData)?.map(cheat => `**${cheat.cheatName}** - ${cheat.filename}`).join('\n') || 'No known cheats detected'}`,
      color: 13311
    };

    // Create Recycle Bin embed
    const recycleBinCleanupTime = await getLastRecycleBinCleanup(recycleFilesData);
    const embed5 = {
      title: "4. Recycle bin",
      description: `Recycle bin files can be found in:\n\n\`\`\`lua\nRecycle-files.txt\`\`\`\n\n**Last recycle bin cleanup:** ${recycleBinCleanupTime}`,
      color: 16776960
    };

    // Calculate cheating percentage
    const cheatPercentage = calculateCheatPercentage(detectionData, suspiciousFilesData);
    
    // Generate percentage bar
    const generatePercentageBar = (percentage) => {
      const greenSquares = Math.floor(percentage / 10);
      const blackSquares = 10 - greenSquares;
      return '🟩'.repeat(greenSquares) + '⬛'.repeat(blackSquares) + ` ${percentage}%`;
    };
    
    // Get author info based on staff member
    const getAuthorInfo = (staffName) => {
      const staffIcons = {
        'Wakka': {
          name: "Wakka",
          icon_url: "https://cdn.discordapp.com/avatars/665982110292508673/970b9af8484e75fb3890db19d2a458b7.webp?size=32"
        },
        'Error': {
          name: "Error", 
          icon_url: "https://cdn.discordapp.com/avatars/375266149740314634/8214141f8a6af0641ac0f1cd6feccd76.webp?size=32"
        },
        'Nemesis': {
          name: "Nemesis",
          icon_url: "https://cdn.discordapp.com/avatars/316327872459571210/efe9629dd726af9f456c9505d994fa4a.webp?size=32"
        },
        'Death': {
          name: "Death",
          icon_url: "https://cdn.discordapp.com/avatars/386584995688480770/a_663bd2a5876bd0cdf3f3994c6db1be04.webp?size=32"
        }
      };
      
      return staffIcons[staffName] || {
        name: "Unknown Staff",
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png"
      };
    };
    
    // Use the same detection logic as in embed4 for consistency
    const detectedCheats = detectCheatsBySize(suspiciousFilesData);
    const authorInfo = getAuthorInfo(checkedBy);
    
    // Create completion summary embed
    const embed7 = {
      title: `PC Check Completed (${computerName})`,
      description: `Suspicious Files Found: **${suspiciousFilesData?.totalFiles || 0}**\n\n` +
        (detectedCheats.length > 0 
          ? `Suspicious Cheats Found:\n${detectedCheats.map(cheat => `> **${cheat.cheatName}**`).join('\n')}\n\n`
          : '') +
        `Percentage of cheating:\n\`\`\`\n${generatePercentageBar(cheatPercentage)}\n\`\`\``,
      color: cheatPercentage >= 70 ? 16711680 : cheatPercentage >= 30 ? 16776960 : 65280,
      author: authorInfo,
      footer: {
        text: "Rusticaland Checker",
        icon_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwPGwkEwy2mzrO5m9hex7qrrZwiUoc283XIw&s"
      },
      timestamp: new Date().toISOString()
    };

    const webhookData = {
      content: null,
      embeds: [embed1, embed2, embed3, embed4, embed5, embed7],
      attachments: []
    };

    // Add log file attachments if available
    if (pcSecurityData?.eventLogBackup) {
      // Note: Discord webhook attachments require file upload, which is complex
      // For now, we'll just log the file paths
      console.log('Event log backup available at:', pcSecurityData.eventLogBackup);
    }

    if (pcSecurityData?.eacLogBackup && pcSecurityData.eacLogBackup.length > 0) {
      console.log('EAC log backups available at:', pcSecurityData.eacLogBackup);
    }

    return webhookData;
  };

  useEffect(() => {
    if (isAuthenticated && isLoading) {
      let isDetectionRunning = false;
      
      // Real detection process with Steam checks
      const performDetection = async () => {
        if (isDetectionRunning) return; // Prevent multiple runs
        isDetectionRunning = true;
        
        const steamDetection = new SteamDetection();
        
        // Log start of detection
        await window.electronAPI?.writeLog('=== PC Check Started ===');
        
        const loadingSteps = [
      { text: 'Initializing system scan...', dynamic: false },
      { text: 'Checking Steam installation...', dynamic: true },
      { text: 'Verifying Rust ownership...', dynamic: false },
      { text: 'Scanning Steam accounts...', dynamic: false },
      { text: 'Checking account bans via Steam API...', dynamic: false },
      { text: 'Analyzing account information...', dynamic: false },
      { text: 'Checking PC security services...', dynamic: true },
      { text: 'Scanning for suspicious files...', dynamic: true },
      { text: 'Backing up event logs...', dynamic: false },
      { text: 'Generating detection report...', dynamic: false },
      { text: 'Finalizing results...', dynamic: false }
    ];

        let currentStep = 0;
        let currentProgress = 0;
        let progressInterval = null;
        let detectionData = null;
        let pcSecurityData = null;
        let suspiciousFilesData = { totalFiles: 0, suspiciousFiles: [], recentlyOpened: [], recentlyDownloaded: [], reportPath: null };
        let recycleFilesData = { totalFiles: 0, recycleFiles: [], reportPath: null };

        const runLoadingStep = async () => {
          if (currentStep < loadingSteps.length) {
            setLoadingText(loadingSteps[currentStep].text);
            await window.electronAPI?.writeLog(`Step ${currentStep + 1}: ${loadingSteps[currentStep].text}`);
            
            const stepProgress = Math.floor((currentStep / loadingSteps.length) * 100);
            const nextStepProgress = Math.floor(((currentStep + 1) / loadingSteps.length) * 100);
            
            currentProgress = stepProgress;
            setProgress(currentProgress);
            await window.electronAPI?.writeLog(`Progress: ${currentProgress}%`);
            
            let stepCompleted = false;
            
            // Perform actual detection during specific steps
            if (currentStep === 1) {
              // Start Steam detection during "Checking Steam installation" step
              await window.electronAPI?.writeLog('Starting Steam detection...');
              try {
                detectionData = await steamDetection.performUserClientCheck();
                await window.electronAPI?.writeLog(`Steam detection completed: ${JSON.stringify(detectionData, null, 2)}`);
                console.log('Steam detection results:', detectionData);
                setDetectionResults(detectionData);
                stepCompleted = true;
              } catch (error) {
                await window.electronAPI?.writeLog(`Steam detection error: ${error.message}`);
                console.error('Steam detection error:', error);
                stepCompleted = true;
              }
            }

            if (currentStep === 6) {
              // Start PC Security check during "Checking PC security services" step
              await window.electronAPI?.writeLog('Starting PC Security check...');
              try {
                const pcSecurityCheck = new PCSecurityCheck();
                pcSecurityData = await pcSecurityCheck.performPCSecurityCheck();
                await window.electronAPI?.writeLog(`PC Security check completed: ${JSON.stringify(pcSecurityData, null, 2)}`);
                console.log('PC Security check results:', pcSecurityData);
                stepCompleted = true;
              } catch (error) {
                await window.electronAPI?.writeLog(`PC Security check error: ${error.message}`);
                console.error('PC Security check error:', error);
                stepCompleted = true;
              }
            }

            if (currentStep === 7) {
              // Start Suspicious Files check during "Scanning for suspicious files" step
              await window.electronAPI?.writeLog('Starting Suspicious Files check...');
              try {
                // Perform the suspicious files check directly
                const drives = await window.electronAPI.getAllDrives();
                await window.electronAPI?.writeLog(`Found drives: ${JSON.stringify(drives)}`);
                const suspiciousFiles = [];
                
                for (const drive of drives) {
                  try {
                    await window.electronAPI?.writeLog(`Scanning drive: ${drive}`);
                    const files = await window.electronAPI.scanDirectory(drive);
                    await window.electronAPI?.writeLog(`Found ${files.length} files on drive ${drive}`);
                    
                    for (const filePath of files) {
                         // Skip Recycle Bin
                         if (/\\\$Recycle\.Bin\\/i.test(filePath)) {
                           continue;
                         }
                         
                         // Skip WinSxS folder
                         if (/\\Windows\\WinSxS\\/i.test(filePath)) {
                           continue;
                         }
                         
                         // Skip legitimate application folders (whitelist)
                         const legitimatePaths = [
                           /\\msys64\\/i,
                           /\\\.conan2\\/i,
                           /\\\.nuget\\/i,
                           /\\Discord\\/i,
                           /\\FiveM\\/i,
                           /\\LGHUB\\/i,
                           /\\Medal\\/i,
                           /\\Roblox\\/i,
                           /\\NVIDIA Corporation\\/i,
                           /\\Visual Studio\\/i,
                           /\\Microsoft\\/i,
                           /\\Program Files\\/i,
                           /\\Program Files \(x86\)\\/i,
                           /\\Windows\\System32\\/i,
                           /\\Windows\\SysWOW64\\/i
                         ];
                         
                         if (legitimatePaths.some(pattern => pattern.test(filePath))) {
                           continue;
                         }
                         
                         const filename = filePath.substring(filePath.lastIndexOf('\\') + 1);
                         const reasons = [];
                         
                         // Use the same logic as SuspiciousFilesCheck.js
                         
                         // Improved random alphanumeric name detection
                         // Check for truly random combinations - long strings without meaningful words
                         const isRandomName = (name) => {
                           const nameWithoutExt = name.replace(/\.[^.]+$/, '');
                           
                           // Must be at least 20 characters long
                           if (nameWithoutExt.length < 20) return false;
                           
                           // Must contain only letters and numbers
                           if (!/^[A-Za-z0-9]+$/.test(nameWithoutExt)) return false;
                           
                           // Check for meaningful words (common legitimate patterns)
                           const meaningfulPatterns = [
                             /compiler/i, /single/i, /file/i, /host/i, /setup/i, /install/i,
                             /update/i, /service/i, /helper/i, /launcher/i, /manager/i,
                             /client/i, /server/i, /daemon/i, /process/i, /system/i,
                             /microsoft/i, /windows/i, /discord/i, /steam/i, /nvidia/i,
                             /intel/i, /amd/i, /google/i, /chrome/i, /firefox/i,
                             /visual/i, /studio/i, /code/i, /git/i, /node/i, /npm/i,
                             /python/i, /java/i, /dotnet/i, /framework/i, /runtime/i
                           ];
                           
                           // If contains meaningful patterns, it's probably legitimate
                           if (meaningfulPatterns.some(pattern => pattern.test(nameWithoutExt))) {
                             return false;
                           }
                           
                           // Check for truly random pattern - high entropy
                           // Count transitions between letters and numbers
                           let transitions = 0;
                           for (let i = 1; i < nameWithoutExt.length; i++) {
                             const prev = /[0-9]/.test(nameWithoutExt[i-1]);
                             const curr = /[0-9]/.test(nameWithoutExt[i]);
                             if (prev !== curr) transitions++;
                           }
                           
                           // Random names typically have many letter-number transitions
                           // Or are very long (32+ chars) with mixed case
                           return transitions > 8 || (nameWithoutExt.length >= 32 && /[a-z]/.test(nameWithoutExt) && /[A-Z]/.test(nameWithoutExt));
                         };
                         
                         if (isRandomName(filename)) {
                           reasons.push('Random alphanumeric name');
                         }
                         
                         // Check for specific suspicious names
                         const specificNames = ['dControl.exe', 'loader.exe', 'ProcessHacker.exe'];
                         if (specificNames.some(name => filename.toLowerCase() === name.toLowerCase())) {
                           reasons.push('Known suspicious filename');
                         }
                         
                         // Check for suspicious name parts (in filename) - excluding anticheat
                         const suspiciousNameParts = ['cheat', 'hack', 'rustiris', 'omega'];
                         const anticheatExclusions = ['anticheat', 'eac', 'battleye', 'vanguard', 'faceit'];
                         const lowerFilename = filename.toLowerCase();
                         
                         // First check if it's anticheat software
                         const isAnticheat = anticheatExclusions.some(exclusion => 
                           lowerFilename.includes(exclusion.toLowerCase())
                         );
                         
                         if (!isAnticheat && suspiciousNameParts.some(part => lowerFilename.includes(part.toLowerCase()))) {
                           reasons.push('Contains suspicious name part (cheat/hack/rustiris/omega)');
                         }
                         
                         // Check for suspicious name parts in folder path - excluding anticheat
                         const lowerFilePath = filePath.toLowerCase();
                         const isAnticheatPath = anticheatExclusions.some(exclusion => 
                           lowerFilePath.includes(exclusion.toLowerCase())
                         );
                         
                         if (!isAnticheatPath && suspiciousNameParts.some(part => lowerFilePath.includes(part.toLowerCase()))) {
                           reasons.push('Located in suspicious folder (cheat/hack/rustiris/omega)');
                         }
                         
                         // Removed suspicious paths check as requested by user
                         
                         // Check for unusual extensions in user folders
                         const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
                         const unusualExtensions = ['.dll', '.sys', '.ocx', '.scr'];
                         const isInUserFolder = /\\Users\\[^\\]+\\/i.test(filePath);
                         
                         if (ext === '.dll' && suspiciousNameParts.some(part => lowerFilename.includes(part.toLowerCase()))) {
                           reasons.push('Suspicious DLL with suspicious name part (cheat/hack/rustiris/omega)');
                         } else if (unusualExtensions.includes(ext) && isInUserFolder) {
                           reasons.push('Unusual extension in user folder');
                         }
                         
                         // Removed "Executable outside standard paths" check as it was flagging too many legitimate files
                       
                       if (reasons.length > 0) {
                         try {
                           const stats = await window.electronAPI.getFileStats(filePath);
                           suspiciousFiles.push({
                             path: filePath,
                             reasons: reasons,
                             stats: stats,
                             filename: filename
                           });
                           await window.electronAPI?.writeLog(`Found suspicious file: ${filePath} - ${reasons.join(', ')}`);
                         } catch (error) {
                           suspiciousFiles.push({
                             path: filePath,
                             reasons: reasons,
                             stats: null,
                             filename: filename
                           });
                           await window.electronAPI?.writeLog(`Found suspicious file (no stats): ${filePath} - ${reasons.join(', ')}`);
                         }
                       }
                     }
                  } catch (error) {
                    await window.electronAPI?.writeLog(`Error scanning drive ${drive}: ${error.message}`);
                    console.error(`Error scanning drive ${drive}:`, error);
                  }
                }
                
                await window.electronAPI?.writeLog(`Total suspicious files found: ${suspiciousFiles.length}`);
                
                // Batch process digital signature checks for performance
                if (suspiciousFiles.length > 0) {
                  await window.electronAPI?.writeLog('Starting batch signature verification...');
                  
                  const batchSize = 10; // Process 10 files at a time
                  const filteredFiles = [];
                  
                  for (let i = 0; i < suspiciousFiles.length; i += batchSize) {
                    const batch = suspiciousFiles.slice(i, i + batchSize);
                    
                    // Process batch in parallel
                    const metadataPromises = batch.map(async (file) => {
                      try {
                        const metadataInfo = await window.electronAPI.checkFileSignature(file.path);
                        
                        // Skip files that have proper metadata (copyright, version, company info)
                        if (metadataInfo && metadataInfo.hasMetadata) {
                          return null; // Will be filtered out
                        }
                        
                        // Add metadata info to reasons for files without proper metadata
                        if (!metadataInfo || !metadataInfo.hasMetadata) {
                          file.reasons.push('Missing file metadata (copyright, version, company info)');
                        }
                        
                        return file;
                      } catch (error) {
                        await window.electronAPI?.writeLog(`Error checking metadata for ${file.path}: ${error.message}`);
                        return file; // Keep file even if metadata check fails
                      }
                    });
                    
                    const batchResults = await Promise.all(metadataPromises);
                    
                    // Add non-null results to filtered files
                    batchResults.forEach(result => {
                      if (result !== null) {
                        filteredFiles.push(result);
                      }
                    });
                    
                    // Update progress
                    const processed = Math.min(i + batchSize, suspiciousFiles.length);
                    await window.electronAPI?.writeLog(`Metadata verification progress: ${processed}/${suspiciousFiles.length}`);
                  }
                  
                  // Update suspicious files list with filtered results
                  suspiciousFiles.length = 0;
                  suspiciousFiles.push(...filteredFiles);
                  
                  await window.electronAPI?.writeLog(`Files after signature filtering: ${suspiciousFiles.length}`);
                }
                
                // Generate report
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
                
                // Save report
                await window.electronAPI.writeFile('Suspicious-files.txt', report);
                await window.electronAPI?.writeLog('Suspicious files report saved to Suspicious-files.txt');
                
                // Scan Recycle Bin
                await window.electronAPI?.writeLog('Starting Recycle Bin scan...');
                const recycleFiles = await window.electronAPI.scanRecycleBin();
                await window.electronAPI?.writeLog(`Found ${recycleFiles.length} files in Recycle Bin`);
                
                // Generate Recycle Bin report
                let recycleReport = `RECYCLE BIN FILES REPORT\n`;
                recycleReport += `Generated: ${new Date().toLocaleString()}\n`;
                recycleReport += `Total files in Recycle Bin: ${recycleFiles.length}\n\n`;
                recycleReport += `${'='.repeat(80)}\n\n`;

                recycleFiles.forEach((file, index) => {
                  recycleReport += `${index + 1}. ${file.path}\n`;
                  recycleReport += `   Filename: ${file.name}\n`;
                  recycleReport += `   Drive: ${file.drive}\n`;
                  recycleReport += `   Size: ${file.size} bytes\n`;
                  recycleReport += `   Deleted: ${new Date(file.deleted).toLocaleString()}\n`;
                  recycleReport += `\n${'-'.repeat(80)}\n\n`;
                });
                
                // Save Recycle Bin report
                await window.electronAPI.writeFile('Recycle-files.txt', recycleReport);
                await window.electronAPI?.writeLog('Recycle Bin report saved to Recycle-files.txt');
                
                // Get recent files
                const recentlyOpened = suspiciousFiles
                  .filter(file => file.stats && file.stats.modified)
                  .sort((a, b) => new Date(b.stats.modified) - new Date(a.stats.modified))
                  .slice(0, 5)
                  .map(file => ({
                    name: file.filename,
                    date: new Date(file.stats.modified).toLocaleDateString('cs-CZ')
                  }));

                const recentlyDownloaded = suspiciousFiles
                  .filter(file => file.stats && file.stats.created)
                  .sort((a, b) => new Date(b.stats.created) - new Date(a.stats.created))
                  .slice(0, 5)
                  .map(file => ({
                    name: file.filename,
                    date: new Date(file.stats.created).toLocaleDateString('cs-CZ')
                  }));
                
                suspiciousFilesData = {
                  totalFiles: suspiciousFiles.length,
                  suspiciousFiles: suspiciousFiles,
                  recentlyOpened: recentlyOpened,
                  recentlyDownloaded: recentlyDownloaded,
                  reportPath: 'Suspicious-files.txt'
                };

                // Create recycleFilesData object
                recycleFilesData = {
                  totalFiles: recycleFiles.length,
                  recycleFiles: recycleFiles,
                  reportPath: 'Recycle-files.txt'
                };
                
                await window.electronAPI?.writeLog(`Suspicious Files check completed: ${JSON.stringify(suspiciousFilesData, null, 2)}`);
                await window.electronAPI?.writeLog(`Recycle Bin check completed: ${JSON.stringify(recycleFilesData, null, 2)}`);
                console.log('Suspicious Files check results:', suspiciousFilesData);
                console.log('Recycle Bin check results:', recycleFilesData);
                stepCompleted = true;
              } catch (error) {
                await window.electronAPI?.writeLog(`Suspicious Files check error: ${error.message}`);
                console.error('Suspicious Files check error:', error);
                stepCompleted = true;
              }
            }
            
            // For dynamic steps, wait for completion. For static steps, use default timing
            if (loadingSteps[currentStep].dynamic && !stepCompleted) {
              // Wait for dynamic step completion (this shouldn't happen as we set stepCompleted above)
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else if (!loadingSteps[currentStep].dynamic) {
              // For non-dynamic steps, use a default short delay
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            progressInterval = setInterval(() => {
              if (currentProgress < nextStepProgress) {
                currentProgress += Math.random() * 2;
                if (currentProgress > nextStepProgress) {
                  currentProgress = nextStepProgress;
                }
                setProgress(Math.floor(currentProgress));
              }
            }, 80);
            
            // Proceed to next step immediately after completion
            setTimeout(() => {
              if (progressInterval) {
                clearInterval(progressInterval);
              }
              
              setTimeout(async () => {
                currentStep++;
                if (currentStep >= loadingSteps.length) {
                  // Send Discord webhook with detection results
                  setTimeout(async () => {
                    try {
                      await window.electronAPI?.writeLog('Preparing Discord webhook...');
                      const computerName = await window.electronAPI?.getComputerName() || 'Unknown PC';
                      const checkedBy = validKeys[authKey];
                      
                      // Ensure suspiciousFilesData has proper structure even if no files found
                      if (!suspiciousFilesData || !suspiciousFilesData.hasOwnProperty('totalFiles')) {
                        suspiciousFilesData = {
                          totalFiles: 0,
                          suspiciousFiles: [],
                          recentlyOpened: [],
                          recentlyDownloaded: [],
                          reportPath: null
                        };
                        await window.electronAPI?.writeLog('Using default suspiciousFilesData - no suspicious files found');
                      }

                      // Ensure recycleFilesData has proper structure even if no files found
                      if (!recycleFilesData || !recycleFilesData.hasOwnProperty('totalFiles')) {
                        recycleFilesData = {
                          totalFiles: 0,
                          recycleFiles: [],
                          reportPath: null
                        };
                        await window.electronAPI?.writeLog('Using default recycleFilesData - no recycle files found');
                      }
                      
                      // USB detection removed as requested
                      
                      const webhookData = await createWebhookData(detectionData, pcSecurityData, suspiciousFilesData, recycleFilesData, computerName, checkedBy);
                      await window.electronAPI?.writeLog(`Webhook data prepared: ${JSON.stringify(webhookData, null, 2)}`);
                      
                      // First send the webhook with embeds
                      const response = await fetch('https://discord.com/api/webhooks/1428793584995536998/jsgfl9zHP-PkcMm-XgTCzPsdHCiPC2YxOICj6JAVIA3AJu4LLLTQBsMcMw5syoh96V_H', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(webhookData)
                      });
                      
                      if (response.ok) {
                        await window.electronAPI?.writeLog('Webhook sent successfully');
                        console.log('Webhook sent successfully');
                        
                        // Try to upload the Suspicious-files.txt file if it exists
                        try {
                          const fileBuffer = await window.electronAPI?.readFileBuffer('Suspicious-files.txt');
                          if (fileBuffer) {
                            const formData = new FormData();
                            const blob = new Blob([fileBuffer], { type: 'text/plain' });
                            formData.append('files[0]', blob, 'Suspicious-files.txt');
                            formData.append('content', `📄 **Suspicious Files Report** - ${computerName}`);
                            
                            const fileResponse = await fetch('https://discord.com/api/webhooks/1428793584995536998/jsgfl9zHP-PkcMm-XgTCzPsdHCiPC2YxOICj6JAVIA3AJu4LLLTQBsMcMw5syoh96V_H', {
                              method: 'POST',
                              body: formData
                            });
                            
                            if (fileResponse.ok) {
                              await window.electronAPI?.writeLog('Suspicious files report uploaded successfully');
                              console.log('File uploaded successfully');
                            } else {
                              const fileErrorText = await fileResponse.text();
                              await window.electronAPI?.writeLog(`File upload failed: ${fileResponse.status} - ${fileErrorText}`);
                            }
                          } else {
                            await window.electronAPI?.writeLog('No Suspicious-files.txt found to upload');
                          }
                        } catch (fileError) {
                          await window.electronAPI?.writeLog(`File upload error: ${fileError.message}`);
                          console.log('File upload error:', fileError);
                        }

                        // Try to upload the Recycle-files.txt file if it exists
                        try {
                          const recycleFileBuffer = await window.electronAPI?.readFileBuffer('Recycle-files.txt');
                          if (recycleFileBuffer) {
                            const recycleFormData = new FormData();
                            const recycleBlob = new Blob([recycleFileBuffer], { type: 'text/plain' });
                            recycleFormData.append('files[0]', recycleBlob, 'Recycle-files.txt');
                            recycleFormData.append('content', `🗑️ **Recycle Bin Files Report** - ${computerName}`);
                            
                            const recycleFileResponse = await fetch('https://discord.com/api/webhooks/1428793584995536998/jsgfl9zHP-PkcMm-XgTCzPsdHCiPC2YxOICj6JAVIA3AJu4LLLTQBsMcMw5syoh96V_H', {
                              method: 'POST',
                              body: recycleFormData
                            });
                            
                            if (recycleFileResponse.ok) {
                              await window.electronAPI?.writeLog('Recycle bin files report uploaded successfully');
                              console.log('Recycle bin file uploaded successfully');
                            } else {
                              const recycleFileErrorText = await recycleFileResponse.text();
                              await window.electronAPI?.writeLog(`Recycle bin file upload failed: ${recycleFileResponse.status} - ${recycleFileErrorText}`);
                            }
                          } else {
                            await window.electronAPI?.writeLog('No Recycle-files.txt found to upload');
                          }
                        } catch (recycleFileError) {
                          await window.electronAPI?.writeLog(`Recycle bin file upload error: ${recycleFileError.message}`);
                          console.log('Recycle bin file upload error:', recycleFileError);
                        }
                      } else {
                        const errorText = await response.text();
                        await window.electronAPI?.writeLog(`Webhook failed with status ${response.status}: ${errorText}`);
                        console.log('Webhook failed:', response.status, errorText);
                      }
                    } catch (error) {
                      await window.electronAPI?.writeLog(`Webhook error: ${error.message}`);
                      console.log('Webhook error:', error);
                    }
                    
                    setTimeout(async () => {
                      await window.electronAPI?.writeLog('=== PC Check Completed ===');
                      setIsLoading(false);
                    }, 2000);
                  }, 1000);
                } else {
                  runLoadingStep();
                }
              }, 300);
            }, 100); // Very short delay since we're now waiting for actual completion
          }
        };

        const timer = setTimeout(() => {
          runLoadingStep();
        }, 1000);

        return () => {
          clearTimeout(timer);
          if (progressInterval) {
            clearInterval(progressInterval);
          }
        };
      };

      performDetection();
    }
  }, [isAuthenticated]);

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeApp();
    }
  };

  // Show authentication in main content if not authenticated
  if (!isAuthenticated) {
    return (
      <AppContainer>
        <TopBar>
          <TopBarTitle>Rusticaland Checker</TopBarTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </TopBar>
        
        <MainContent>
        <AuthContainer>
          <AuthInput
            type="text"
            placeholder="PCCheck Code"
            value={authKey}
            onChange={(e) => setAuthKey(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <AuthButton onClick={handleAuth}>
            Check
          </AuthButton>
        </AuthContainer>
      </MainContent>
        
        <BottomBar>
          <VersionText>b1.0.0</VersionText>
        </BottomBar>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <TopBar>
        <TopBarTitle>Rusticaland Checker</TopBarTitle>
        <CloseButton onClick={handleClose}>×</CloseButton>
      </TopBar>
      
      <MainContent>
        {isLoading ? (
          <LoadingContainer>
          <LoadingSpinner>
            <LoadingDots>
              <CenterDot />
            </LoadingDots>
          </LoadingSpinner>
          <LoadingText>{loadingText}</LoadingText>
          <ProgressText>{progress}%</ProgressText>
        </LoadingContainer>
        ) : (
          <div style={{ color: 'white', textAlign: 'center', fontFamily: 'Rubik, sans-serif', fontSize: '16px' }}>
            PC Check Completed. You can close this window now.
          </div>
        )}
      </MainContent>
      
      <BottomBar>
        <VersionText>b1.0.0</VersionText>
      </BottomBar>
    </AppContainer>
  );
}

export default App;