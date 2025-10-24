import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import SteamDetection from './components/SteamDetection';
import PCSecurityCheck from './components/PCSecurityCheck';
import SuspiciousFilesCheck from './components/SuspiciousFilesCheck';

// Server configuration
const SERVER_URL = 'SERVER';
const BOT_API_TOKEN = 'BOT-TOKEN';

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
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState('');
  const [serverConnected, setServerConnected] = useState(false);
  const [appVersion] = useState('b1.0.0');
  const [userInfo, setUserInfo] = useState(null);
  




  // Function to verify server version
  const verifyServerVersion = async () => {
    try {
      setLoadingText('Connecting to server...');
      console.log(`Connecting to server: ${SERVER_URL}`);
      
      const response = await fetch(`${SERVER_URL}/api/version`);
      
      if (!response.ok) {
        throw new Error(`Server responded with error: ${response.status}`);
      }
      
      setLoadingText('Verifying server version...');
      const data = await response.json();
      console.log(`Server version: ${data.version}, App version: ${appVersion}`);
      
      if (data.version !== appVersion) {
        throw new Error(`Incompatible version. Server: ${data.version}, Application: ${appVersion}`);
      }
      
      setLoadingText('Server connection successful!');
      console.log('Server connection successful');
      setServerConnected(true);
      return true;
    } catch (error) {
      console.error('Server verification failed:', error);
      setInitError(`Connection error: ${error.message}`);
      return false;
    }
  };

  // Function to redeem a code
  const redeemCode = async (code) => {
    try {
      console.log(`Redeeming code: ${code}`);
      
      const response = await fetch(`${SERVER_URL}/api/codes/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to redeem code: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Code redeemed successfully:', data);
      return data;
    } catch (error) {
      console.error('Code redemption failed:', error);
      throw error;
    }
  };

  // Function to send PC Check in Progress embed
  const sendPCCheckProgressEmbed = async (code) => {
    try {
      console.log(`Sending PC Check in Progress embed for code: ${code}`);
      
      const embedData = {
        content: null,
        embeds: [
          {
            title: "🧠 PC Check in Progress",
            description: "**Status:** Connected to user's system.\n**Action:** Performing active PC scan and data collection...\n\n> 🧩 Please wait while system information, security modules, and suspicious files are being analyzed.",
            color: 3447003,
            footer: {
              text: "Rusticaland • PC Check System",
              icon_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwPGwkEwy2mzrO5m9hex7qrrZwiUoc283XIw&s"
            },
            timestamp: new Date().toISOString()
          }
        ],
        attachments: []
      };
      
      const response = await fetch(`${SERVER_URL}/api/webhook/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          embedData: embedData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send progress embed: ${response.status}`);
      }
      
      console.log('PC Check in Progress embed sent successfully');
    } catch (error) {
      console.error('Failed to send progress embed:', error);
      // Don't throw error here as it's not critical for authentication
    }
  };

  // Function to check if code is active
  const checkCodeStatus = async (code) => {
    try {
      setLoadingText('Verifying code validity...');
      console.log(`Checking code status for: ${code}`);
      
      const response = await fetch(`${SERVER_URL}/api/codes/${encodeURIComponent(code)}/active`);
      
      if (!response.ok) {
        throw new Error(`Server responded with error: ${response.status}`);
      }
      
      setLoadingText('Processing server response...');
      const data = await response.json();
      console.log(`Code status response:`, data);
      
      if (data.active === true) {
        setLoadingText('Code is valid!');
        console.log(`Code is active, remaining time: ${data.remainingMs}ms`);
      } else {
        setLoadingText('Code is not valid');
        console.log('Code is not active');
      }
      
      return data.active === true;
    } catch (error) {
      console.error('Code verification failed:', error);
      setAuthError('Failed to verify code. Please try again.');
      return false;
    }
  };

  const handleAuth = async () => {
    if (!serverConnected) {
      setAuthError('Server is not connected. Please restart the application.');
      return;
    }

    setAuthError('');
    setIsLoading(true);
    setLoadingText('Starting verification...');
    console.log('Starting authentication process');

    try {
      // Check if code is active on server
      setLoadingText('Checking code activity on server...');
      const isCodeActive = await checkCodeStatus(authKey);
      
      if (!isCodeActive) {
        setAuthError('Code is not active or does not exist.');
        setIsLoading(false);
        return;
      }

      // If code is active, redeem the code and authenticate user
      setLoadingText('Activating code...');
      console.log(`Code ${authKey} is active - redeeming and authenticating user`);
      
      // Redeem the code and store user info
      const redemptionData = await redeemCode(authKey);
      setUserInfo(redemptionData);
      
      // Send PC Check in Progress embed
      await sendPCCheckProgressEmbed(authKey);
      
      setLoadingText('Logging in...');
      setIsAuthenticated(true);
      setAuthError('');
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('Authentication failed. Please try again.');
      setIsLoading(false);
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
        return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
    } catch (error) {
      console.error('Error getting cleanup time:', error);
    }
    
    // Fallback to checking if recycle bin has files
    if (!recycleFilesData || !recycleFilesData.recycleFiles || recycleFilesData.recycleFiles.length === 0) {
      return 'Recycle bin is empty - deletion date not available';
    }
    
    // Find the most recent deletion time
    const mostRecentDeletion = recycleFilesData.recycleFiles
      .map(file => new Date(file.deleted))
      .sort((a, b) => b - a)[0];
    
    return mostRecentDeletion.toLocaleDateString('en-US') + ' ' + mostRecentDeletion.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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

  // Function to send data to bot instead of webhook
  const sendDataToBot = async (detectionData, pcSecurityData, suspiciousFilesData, recycleFilesData, registryData, computerName, checkedBy) => {
    try {
      await window.electronAPI?.writeLog('Starting sendDataToBot function...');
      
      const timestamp = new Date().toISOString();
      const cheatPercentage = calculateCheatPercentage(detectionData, suspiciousFilesData);
      const ticketId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await window.electronAPI?.writeLog(`Generated ticket ID: ${ticketId}`);
      
      // Prepare main data (without files)
      const mainData = {
        type: 'pc_check_files',
        ticketId,
        computerName,
        checkedBy,
        authKey,
        timestamp,
        cheatPercentage,
        detectionResults: detectionData,
        pcSecurityData: pcSecurityData
      };
      
      // Create file contents
      const dataContent = JSON.stringify(mainData, null, 2);
      const suspiciousFilesContent = JSON.stringify(suspiciousFilesData, null, 2);
      const recycleFilesContent = JSON.stringify(recycleFilesData, null, 2);
      
      await window.electronAPI?.writeLog('Uploading files to server...');
      
      // Upload main data file
      const dataFormData = new FormData();
      dataFormData.append('file', new Blob([dataContent], { type: 'application/json' }), `data_${ticketId}.txt`);
      dataFormData.append('ticketId', ticketId);
      dataFormData.append('fileType', 'data');
      
      const dataResponse = await fetch(`${SERVER_URL}/api/upload-file`, {
        method: 'POST',
        body: dataFormData
      });
      
      if (!dataResponse.ok) {
        throw new Error(`Failed to upload data file: ${dataResponse.status}`);
      }
      
      // Upload suspicious files
      const suspiciousFormData = new FormData();
      suspiciousFormData.append('file', new Blob([suspiciousFilesContent], { type: 'application/json' }), `suspicious-files_${ticketId}.txt`);
      suspiciousFormData.append('ticketId', ticketId);
      suspiciousFormData.append('fileType', 'suspicious-files');
      
      const suspiciousResponse = await fetch(`${SERVER_URL}/api/upload-file`, {
        method: 'POST',
        body: suspiciousFormData
      });
      
      if (!suspiciousResponse.ok) {
        throw new Error(`Failed to upload suspicious files: ${suspiciousResponse.status}`);
      }
      
      // Upload recycle bin files
      const recycleFormData = new FormData();
      recycleFormData.append('file', new Blob([recycleFilesContent], { type: 'application/json' }), `recycle-bin_${ticketId}.txt`);
      recycleFormData.append('ticketId', ticketId);
      recycleFormData.append('fileType', 'recycle-bin');
      
      const recycleResponse = await fetch(`${SERVER_URL}/api/upload-file`, {
        method: 'POST',
        body: recycleFormData
      });
      
      if (!recycleResponse.ok) {
        throw new Error(`Failed to upload recycle bin files: ${recycleResponse.status}`);
      }
      
      // Upload registry dumps
      if (registryData) {
        // Upload Compatibility Assistant Store
        if (registryData.compatibilityAssistant) {
          const compatFormData = new FormData();
          // Format array data properly - each item on new line
          const compatContent = Array.isArray(registryData.compatibilityAssistant) 
            ? registryData.compatibilityAssistant.join('\n')
            : registryData.compatibilityAssistant;
          compatFormData.append('file', new Blob([compatContent], { type: 'text/plain' }), `compatibility-assistant_${ticketId}.txt`);
          compatFormData.append('ticketId', ticketId);
          compatFormData.append('fileType', 'compatibility-assistant');
          
          const compatResponse = await fetch(`${SERVER_URL}/api/upload-file`, {
            method: 'POST',
            body: compatFormData
          });
          
          if (!compatResponse.ok) {
            throw new Error(`Failed to upload compatibility assistant file: ${compatResponse.status}`);
          }
        }
        
        // Upload AppSwitched
        if (registryData.appSwitched) {
          const appSwitchedFormData = new FormData();
          // Format array data properly - each item on new line
          const appSwitchedContent = Array.isArray(registryData.appSwitched) 
            ? registryData.appSwitched.join('\n')
            : registryData.appSwitched;
          appSwitchedFormData.append('file', new Blob([appSwitchedContent], { type: 'text/plain' }), `app-switched_${ticketId}.txt`);
          appSwitchedFormData.append('ticketId', ticketId);
          appSwitchedFormData.append('fileType', 'app-switched');
          
          const appSwitchedResponse = await fetch(`${SERVER_URL}/api/upload-file`, {
            method: 'POST',
            body: appSwitchedFormData
          });
          
          if (!appSwitchedResponse.ok) {
            throw new Error(`Failed to upload app switched file: ${appSwitchedResponse.status}`);
          }
        }
        
        // Upload MuiCache
        if (registryData.muiCache) {
          const muiCacheFormData = new FormData();
          // Format array data properly - extract name from objects and put each on new line
          let muiCacheContent;
          if (Array.isArray(registryData.muiCache)) {
            muiCacheContent = registryData.muiCache
              .map(item => {
                if (typeof item === 'string') {
                  // Remove .FriendlyAppName suffix if present
                  return item.replace(/\.FriendlyAppName$/, '');
                }
                if (item && typeof item === 'object' && item.name) {
                  // Remove .FriendlyAppName suffix if present
                  return item.name.replace(/\.FriendlyAppName$/, '');
                }
                return JSON.stringify(item);
              })
              .join('\n');
          } else {
            muiCacheContent = registryData.muiCache;
          }
          muiCacheFormData.append('file', new Blob([muiCacheContent], { type: 'text/plain' }), `mui-cache_${ticketId}.txt`);
          muiCacheFormData.append('ticketId', ticketId);
          muiCacheFormData.append('fileType', 'mui-cache');
          
          const muiCacheResponse = await fetch(`${SERVER_URL}/api/upload-file`, {
            method: 'POST',
            body: muiCacheFormData
          });
          
          if (!muiCacheResponse.ok) {
            throw new Error(`Failed to upload mui cache file: ${muiCacheResponse.status}`);
          }
        }
      }
      
      await window.electronAPI?.writeLog(`All files uploaded successfully for ticket: ${ticketId}`);
      return true;
      
    } catch (error) {
      await window.electronAPI?.writeLog(`Error uploading files: ${error.message}`);
      return false;
    }
  };

  // Send basic PC check information
  const sendBasicPCInfo = async (computerName, checkedBy, timestamp, cheatPercentage) => {
    try {
      const basicData = {
        type: 'pc_check_basic',
        data: {
          computerName,
          checkedBy,
          authKey,
          timestamp,
          cheatPercentage
        }
      };

      await window.electronAPI?.writeLog(`Sending basic PC info for code: ${authKey}`);

      const response = await fetch(`${SERVER_URL}/api/bot/send-embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_API_TOKEN}`
        },
        body: JSON.stringify({ data: basicData })
      });

      if (response.ok) {
        await window.electronAPI?.writeLog('Basic PC info sent successfully');
        return true;
      } else {
        const errorText = await response.text();
        await window.electronAPI?.writeLog(`Basic PC info failed: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`Basic PC info error: ${error.message}`);
      return false;
    }
  };

  // Send detection data separately with automatic splitting
  const sendDetectionData = async (detectionData) => {
    try {
      // Check if we need to split the data
      const testChunk = {
        type: 'pc_check_detection',
        data: {
          authKey,
          detectionResults: detectionData
        }
      };

      const payloadSize = getPayloadSize({ data: testChunk });
      const maxPayloadSize = 50 * 1024; // 50KB limit (very conservative to ensure chunking works)

      await window.electronAPI?.writeLog(`Detection data payload size: ${payloadSize} bytes`);

      if (payloadSize > maxPayloadSize) {
        await window.electronAPI?.writeLog('Detection payload too large, splitting detection data...');
        
        // Split Steam accounts if there are many
        if (detectionData.accounts && detectionData.accounts.length > 10) {
          const accountChunks = splitArrayData(detectionData.accounts, 10);
          for (let i = 0; i < accountChunks.length; i++) {
            const chunkData = {
              ...detectionData,
              accounts: accountChunks[i],
              chunkInfo: { part: i + 1, total: accountChunks.length, type: 'accounts' }
            };
            
            const result = await sendSingleDetectionChunk(chunkData, `detection_accounts_${i + 1}`);
            if (!result) return false;
          }
        }

        // Send remaining detection data (without accounts to reduce size)
        const remainingData = {
          ...detectionData,
          accounts: [], // Clear accounts array
          chunkInfo: { part: 1, total: 1, type: 'remaining' }
        };
        
        return await sendSingleDetectionChunk(remainingData, 'detection_remaining');
      } else {
        // Send as single chunk if size is acceptable
        return await sendSingleDetectionChunk(detectionData, 'detection_single');
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`Detection data error: ${error.message}`);
      return false;
    }
  };

  // Helper function to send a single detection chunk
  const sendSingleDetectionChunk = async (detectionData, chunkId) => {
    try {
      const detectionChunk = {
        type: 'pc_check_detection',
        data: {
          authKey,
          detectionResults: detectionData,
          chunkId
        }
      };

      const response = await fetch(`${SERVER_URL}/api/bot/send-embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_API_TOKEN}`
        },
        body: JSON.stringify({ data: detectionChunk })
      });

      if (response.ok) {
        await window.electronAPI?.writeLog(`Detection chunk ${chunkId} sent successfully`);
        return true;
      } else {
        const errorText = await response.text();
        await window.electronAPI?.writeLog(`Detection chunk ${chunkId} failed: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`Detection chunk ${chunkId} error: ${error.message}`);
      return false;
    }
  };

  // Send PC security data separately with automatic splitting
  const sendPCSecurityData = async (pcSecurityData) => {
    try {
      // Check if we need to split the data
      const testChunk = {
        type: 'pc_check_security',
        data: {
          authKey,
          pcSecurity: pcSecurityData
        }
      };

      const payloadSize = getPayloadSize({ data: testChunk });
      const maxPayloadSize = 50 * 1024; // 50KB limit (very conservative to ensure chunking works)

      await window.electronAPI?.writeLog(`PC security data payload size: ${payloadSize} bytes`);

      if (payloadSize > maxPayloadSize) {
        await window.electronAPI?.writeLog('PC security payload too large, splitting security data...');
        
        // More aggressive splitting with smaller chunks
        const splitSecurityData = { ...pcSecurityData };
        let chunkCount = 0;
        
        // Split firewall rules with smaller chunks
        if (pcSecurityData.firewallRules && pcSecurityData.firewallRules.length > 5) {
          const firewallChunks = splitArrayData(pcSecurityData.firewallRules, 5);
          for (let i = 0; i < firewallChunks.length; i++) {
            const chunkData = {
              firewallRules: firewallChunks[i],
              chunkInfo: { part: i + 1, total: firewallChunks.length, type: 'firewall' }
            };
            
            const result = await sendSingleSecurityChunk(chunkData, `security_firewall_${i + 1}`);
            if (!result) return false;
            chunkCount++;
          }
          splitSecurityData.firewallRules = []; // Clear to reduce size
        }

        // Split installed security software with smaller chunks
        if (pcSecurityData.installedSecurity && pcSecurityData.installedSecurity.length > 3) {
          const securityChunks = splitArrayData(pcSecurityData.installedSecurity, 3);
          for (let i = 0; i < securityChunks.length; i++) {
            const chunkData = {
              installedSecurity: securityChunks[i],
              chunkInfo: { part: i + 1, total: securityChunks.length, type: 'installed_security' }
            };
            
            const result = await sendSingleSecurityChunk(chunkData, `security_installed_${i + 1}`);
            if (!result) return false;
            chunkCount++;
          }
          splitSecurityData.installedSecurity = []; // Clear to reduce size
        }

        // Split user accounts if there are many
        if (pcSecurityData.userAccounts && pcSecurityData.userAccounts.length > 3) {
          const userChunks = splitArrayData(pcSecurityData.userAccounts, 3);
          for (let i = 0; i < userChunks.length; i++) {
            const chunkData = {
              userAccounts: userChunks[i],
              chunkInfo: { part: i + 1, total: userChunks.length, type: 'user_accounts' }
            };
            
            const result = await sendSingleSecurityChunk(chunkData, `security_users_${i + 1}`);
            if (!result) return false;
            chunkCount++;
          }
          splitSecurityData.userAccounts = []; // Clear to reduce size
        }

        // Split registry keys if there are many
        if (pcSecurityData.registryKeys && pcSecurityData.registryKeys.length > 5) {
          const registryChunks = splitArrayData(pcSecurityData.registryKeys, 5);
          for (let i = 0; i < registryChunks.length; i++) {
            const chunkData = {
              registryKeys: registryChunks[i],
              chunkInfo: { part: i + 1, total: registryChunks.length, type: 'registry_keys' }
            };
            
            const result = await sendSingleSecurityChunk(chunkData, `security_registry_${i + 1}`);
            if (!result) return false;
            chunkCount++;
          }
          splitSecurityData.registryKeys = []; // Clear to reduce size
        }

        // Check if remaining data is still too large
        const remainingTestChunk = {
          type: 'pc_check_security',
          data: {
            authKey,
            pcSecurity: splitSecurityData
          }
        };
        
        const remainingSize = getPayloadSize({ data: remainingTestChunk });
        await window.electronAPI?.writeLog(`Remaining security data size: ${remainingSize} bytes`);
        
        if (remainingSize > maxPayloadSize) {
          // Split remaining data into smaller pieces
          const remainingKeys = Object.keys(splitSecurityData);
          const keyChunks = splitArrayData(remainingKeys, 2); // Split into chunks of 2 keys each
          
          for (let i = 0; i < keyChunks.length; i++) {
            const chunkData = {};
            keyChunks[i].forEach(key => {
              if (splitSecurityData[key] !== undefined) {
                chunkData[key] = splitSecurityData[key];
              }
            });
            chunkData.chunkInfo = { part: i + 1, total: keyChunks.length, type: 'remaining_split' };
            
            const result = await sendSingleSecurityChunk(chunkData, `security_remaining_${i + 1}`);
            if (!result) return false;
            chunkCount++;
          }
        } else {
          // Send remaining security data
          if (Object.keys(splitSecurityData).length > 0) {
            splitSecurityData.chunkInfo = { part: 1, total: 1, type: 'remaining' };
            const result = await sendSingleSecurityChunk(splitSecurityData, 'security_remaining');
            if (!result) return false;
            chunkCount++;
          }
        }
        
        await window.electronAPI?.writeLog(`Security data split into ${chunkCount} chunks`);
        return true;
      } else {
        // Send as single chunk if size is acceptable
        return await sendSingleSecurityChunk(pcSecurityData, 'security_single');
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`PC security data error: ${error.message}`);
      return false;
    }
  };

  // Helper function to send a single security chunk
  const sendSingleSecurityChunk = async (pcSecurityData, chunkId) => {
    try {
      const securityChunk = {
        type: 'pc_check_security',
        data: {
          authKey,
          pcSecurity: pcSecurityData,
          chunkId
        }
      };

      const response = await fetch(`${SERVER_URL}/api/bot/send-embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_API_TOKEN}`
        },
        body: JSON.stringify({ data: securityChunk })
      });

      if (response.ok) {
        await window.electronAPI?.writeLog(`PC security chunk ${chunkId} sent successfully`);
        return true;
      } else {
        const errorText = await response.text();
        await window.electronAPI?.writeLog(`PC security chunk ${chunkId} failed: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`PC security chunk ${chunkId} error: ${error.message}`);
      return false;
    }
  };

  // Helper function to check payload size and split if necessary
  const getPayloadSize = (data) => {
    return new Blob([JSON.stringify(data)]).size;
  };

  const splitArrayData = (array, maxChunkSize = 50) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += maxChunkSize) {
      chunks.push(array.slice(i, i + maxChunkSize));
    }
    return chunks;
  };

  // Send suspicious files data separately with automatic splitting
  const sendSuspiciousFilesData = async (suspiciousFilesData) => {
    try {
      // Check if we need to split the data
      const testChunk = {
        type: 'pc_check_suspicious',
        data: {
          authKey,
          suspiciousFiles: suspiciousFilesData
        }
      };

      const payloadSize = getPayloadSize({ data: testChunk });
      const maxPayloadSize = 50 * 1024; // 50KB limit (very conservative to ensure chunking works)

      await window.electronAPI?.writeLog(`Suspicious files payload size: ${payloadSize} bytes`);

      if (payloadSize > maxPayloadSize) {
        await window.electronAPI?.writeLog('Payload too large, splitting suspicious files data...');
        
        // Split different arrays within suspicious files
        const splitData = { ...suspiciousFilesData };
        
        // Split large arrays
        if (suspiciousFilesData.mostSuspicious && suspiciousFilesData.mostSuspicious.length > 20) {
          const chunks = splitArrayData(suspiciousFilesData.mostSuspicious, 20);
          for (let i = 0; i < chunks.length; i++) {
            const chunkData = {
              ...splitData,
              mostSuspicious: chunks[i],
              chunkInfo: { part: i + 1, total: chunks.length, type: 'mostSuspicious' }
            };
            
            const result = await sendSingleSuspiciousChunk(chunkData, `suspicious_most_${i + 1}`);
            if (!result) return false;
          }
        }

        if (suspiciousFilesData.lastOpened && suspiciousFilesData.lastOpened.length > 20) {
          const chunks = splitArrayData(suspiciousFilesData.lastOpened, 20);
          for (let i = 0; i < chunks.length; i++) {
            const chunkData = {
              ...splitData,
              lastOpened: chunks[i],
              mostSuspicious: [], // Clear other arrays to reduce size
              chunkInfo: { part: i + 1, total: chunks.length, type: 'lastOpened' }
            };
            
            const result = await sendSingleSuspiciousChunk(chunkData, `suspicious_opened_${i + 1}`);
            if (!result) return false;
          }
        }

        if (suspiciousFilesData.lastDownloaded && suspiciousFilesData.lastDownloaded.length > 20) {
          const chunks = splitArrayData(suspiciousFilesData.lastDownloaded, 20);
          for (let i = 0; i < chunks.length; i++) {
            const chunkData = {
              ...splitData,
              lastDownloaded: chunks[i],
              mostSuspicious: [], // Clear other arrays
              lastOpened: [],
              chunkInfo: { part: i + 1, total: chunks.length, type: 'lastDownloaded' }
            };
            
            const result = await sendSingleSuspiciousChunk(chunkData, `suspicious_downloaded_${i + 1}`);
            if (!result) return false;
          }
        }

        // Send remaining data (DLLs, possible cheats, etc.)
        const remainingData = {
          ...splitData,
          mostSuspicious: [], // Clear large arrays
          lastOpened: [],
          lastDownloaded: [],
          chunkInfo: { part: 1, total: 1, type: 'remaining' }
        };
        
        return await sendSingleSuspiciousChunk(remainingData, 'suspicious_remaining');
      } else {
        // Send as single chunk if size is acceptable
        return await sendSingleSuspiciousChunk(suspiciousFilesData, 'suspicious_single');
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`Suspicious files data error: ${error.message}`);
      return false;
    }
  };

  // Helper function to send a single suspicious files chunk
  const sendSingleSuspiciousChunk = async (suspiciousFilesData, chunkId) => {
    try {
      const suspiciousChunk = {
        type: 'pc_check_suspicious',
        data: {
          authKey,
          suspiciousFiles: suspiciousFilesData,
          chunkId
        }
      };

      const response = await fetch(`${SERVER_URL}/api/bot/send-embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_API_TOKEN}`
        },
        body: JSON.stringify({ data: suspiciousChunk })
      });

      if (response.ok) {
        await window.electronAPI?.writeLog(`Suspicious files chunk ${chunkId} sent successfully`);
        return true;
      } else {
        const errorText = await response.text();
        await window.electronAPI?.writeLog(`Suspicious files chunk ${chunkId} failed: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`Suspicious files chunk ${chunkId} error: ${error.message}`);
      return false;
    }
  };

  // Helper function to send a single recycle files chunk
  const sendSingleRecycleChunk = async (recycleData, chunkId) => {
    try {
      const recycleChunk = {
        type: 'pc_check_recycle',
        data: {
          authKey,
          recycleFiles: recycleData
        }
      };

      const response = await fetch(`${SERVER_URL}/api/bot/send-embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_API_TOKEN}`
        },
        body: JSON.stringify({ data: recycleChunk })
      });

      if (response.ok) {
        await window.electronAPI?.writeLog(`Recycle files chunk ${chunkId} sent successfully`);
        return true;
      } else {
        const errorText = await response.text();
        await window.electronAPI?.writeLog(`Recycle files chunk ${chunkId} failed: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`Recycle files chunk ${chunkId} error: ${error.message}`);
      return false;
    }
  };

  // Send recycle files data separately
  const sendRecycleFilesData = async (recycleFilesData) => {
    try {
      const maxPayloadSize = 50 * 1024; // 50KB limit (very conservative to ensure chunking works)
      
      // Check payload size first
      const testChunk = {
        type: 'pc_check_recycle',
        data: {
          authKey,
          recycleFiles: recycleFilesData
        }
      };
      
      const payloadSize = getPayloadSize({ data: testChunk });
      await window.electronAPI?.writeLog(`Recycle files payload size: ${payloadSize} bytes`);
      
      if (payloadSize > maxPayloadSize) {
        await window.electronAPI?.writeLog('Recycle files payload too large, splitting data...');
        
        // Split recycle files if there are many
        if (recycleFilesData.recycleFiles && recycleFilesData.recycleFiles.length > 3) {
          const recycleChunks = splitArrayData(recycleFilesData.recycleFiles, 3);
          let chunkCount = 0;
          
          for (let i = 0; i < recycleChunks.length; i++) {
            const chunkData = {
              ...recycleFilesData,
              recycleFiles: recycleChunks[i],
              chunkInfo: { part: i + 1, total: recycleChunks.length, type: 'recycle_files' }
            };
            
            const result = await sendSingleRecycleChunk(chunkData, `recycle_${i + 1}`);
            if (!result) return false;
            chunkCount++;
          }
          
          await window.electronAPI?.writeLog(`Recycle files data split into ${chunkCount} chunks`);
          return true;
        } else {
          // If still too large but few files, try smaller chunks
          const recycleChunks = splitArrayData(recycleFilesData.recycleFiles || [], 2);
          let chunkCount = 0;
          
          for (let i = 0; i < recycleChunks.length; i++) {
            const chunkData = {
              totalFiles: recycleFilesData.totalFiles,
              recycleFiles: recycleChunks[i],
              reportPath: i === 0 ? recycleFilesData.reportPath : null,
              chunkInfo: { part: i + 1, total: recycleChunks.length, type: 'recycle_files_small' }
            };
            
            const result = await sendSingleRecycleChunk(chunkData, `recycle_small_${i + 1}`);
            if (!result) return false;
            chunkCount++;
          }
          
          await window.electronAPI?.writeLog(`Recycle files data split into ${chunkCount} small chunks`);
          return true;
        }
      } else {
        // Send as single chunk if size is acceptable
        return await sendSingleRecycleChunk(recycleFilesData, 'recycle_single');
      }
    } catch (error) {
      await window.electronAPI?.writeLog(`Recycle files data error: ${error.message}`);
      return false;
    }
  };

  // Function to create Discord webhook data based on detection results (kept for reference)
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

  // Initialize application on startup
  useEffect(() => {
    const initializeApp = async () => {
      setLoadingText('Starting application...');
      console.log('Application initialization started');
      
      // Verify server connection and version
      setLoadingText('Verifying server connection...');
      const serverOk = await verifyServerVersion();
      
      if (serverOk) {
        setLoadingText('Application is ready!');
        console.log('Application initialization completed successfully');
        setIsInitializing(false);
      } else {
        setLoadingText('Connection error - application will close in 3 seconds');
        console.log('Application initialization failed - closing in 3 seconds');
        // Show error and close app after 3 seconds
        setTimeout(() => {
          if (window.electronAPI) {
            window.electronAPI.closeApp();
          }
        }, 3000);
      }
    };

    initializeApp();
  }, []);

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
                  // Send data to bot instead of webhook
                  setTimeout(async () => {
                    try {
                      await window.electronAPI?.writeLog('Preparing data for bot...');
                      const computerName = await window.electronAPI?.getComputerName() || 'Unknown PC';
                      const checkedBy = userInfo?.metadata?.staffName || 'Unknown Staff';
                      
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
                      
                      // Collect registry data
                      await window.electronAPI?.writeLog('Collecting registry data...');
                      let registryData = null;
                      try {
                        const compatibilityAssistant = await window.electronAPI?.dumpCompatibilityAssistantStore();
                        const appSwitched = await window.electronAPI?.dumpAppSwitched();
                        const muiCache = await window.electronAPI?.dumpMuiCache();
                        
                        registryData = {
                          compatibilityAssistant,
                          appSwitched,
                          muiCache
                        };
                        
                        await window.electronAPI?.writeLog('Registry data collected successfully');
                      } catch (error) {
                        await window.electronAPI?.writeLog(`Registry data collection error: ${error.message}`);
                        registryData = null;
                      }
                      
                      // Send data to bot
                      await window.electronAPI?.writeLog('About to call sendDataToBot function...');
                      const success = await sendDataToBot(detectionData, pcSecurityData, suspiciousFilesData, recycleFilesData, registryData, computerName, checkedBy);
                      await window.electronAPI?.writeLog(`sendDataToBot returned: ${success}`);
                      
                      if (success) {
                        await window.electronAPI?.writeLog('Data successfully sent to bot');
                        
                        // Try to send file data to bot as well
                        try {
                          const fileBuffer = await window.electronAPI?.readFileBuffer('Suspicious-files.txt');
                          if (fileBuffer) {
                            const fileData = {
                              type: 'file_upload',
                              data: {
                                fileName: 'Suspicious-files.txt',
                                fileContent: fileBuffer.toString(),
                                computerName,
                                authKey,
                                fileType: 'suspicious_files'
                              }
                            };
                            
                            const fileResponse = await fetch(`${SERVER_URL}/api/bot/send-file`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${BOT_API_TOKEN}`
                              },
                              body: JSON.stringify(fileData)
                            });
                            
                            if (fileResponse.ok) {
                              await window.electronAPI?.writeLog('Suspicious files report sent to bot successfully');
                            }
                          }
                        } catch (fileError) {
                          await window.electronAPI?.writeLog(`File send error: ${fileError.message}`);
                        }

                        // Try to send recycle bin file data to bot
                        try {
                          const recycleFileBuffer = await window.electronAPI?.readFileBuffer('Recycle-files.txt');
                          if (recycleFileBuffer) {
                            const recycleFileData = {
                              type: 'file_upload',
                              data: {
                                fileName: 'Recycle-files.txt',
                                fileContent: recycleFileBuffer.toString(),
                                computerName,
                                authKey,
                                fileType: 'recycle_files'
                              }
                            };
                            
                            const recycleFileResponse = await fetch(`${SERVER_URL}/api/bot/send-file`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${BOT_API_TOKEN}`
                              },
                              body: JSON.stringify(recycleFileData)
                            });
                            
                            if (recycleFileResponse.ok) {
                              await window.electronAPI?.writeLog('Recycle bin files report sent to bot successfully');
                            }
                          }
                        } catch (recycleFileError) {
                          await window.electronAPI?.writeLog(`Recycle bin file send error: ${recycleFileError.message}`);
                        }

                        // Try to send registry files to bot
                        if (registryData) {
                          // Send compatibility assistant file
                          if (registryData.compatibilityAssistant) {
                            try {
                              // Format array data properly - each item on new line
                              const compatContent = Array.isArray(registryData.compatibilityAssistant) 
                                ? registryData.compatibilityAssistant.join('\n')
                                : registryData.compatibilityAssistant;
                              
                              const compatFileData = {
                                type: 'file_upload',
                                data: {
                                  fileName: 'compatibility-assistant.txt',
                                  fileContent: compatContent,
                                  computerName,
                                  authKey,
                                  fileType: 'compatibility_assistant'
                                }
                              };
                              
                              const compatFileResponse = await fetch(`${SERVER_URL}/api/bot/send-file`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${BOT_API_TOKEN}`
                                },
                                body: JSON.stringify(compatFileData)
                              });
                              
                              if (compatFileResponse.ok) {
                                await window.electronAPI?.writeLog('Compatibility assistant file sent to bot successfully');
                              }
                            } catch (compatFileError) {
                              await window.electronAPI?.writeLog(`Compatibility assistant file send error: ${compatFileError.message}`);
                            }
                          }

                          // Send app switched file
                          if (registryData.appSwitched) {
                            try {
                              // Format array data properly - each item on new line
                              const appSwitchedContent = Array.isArray(registryData.appSwitched) 
                                ? registryData.appSwitched.join('\n')
                                : registryData.appSwitched;
                              
                              const appSwitchedFileData = {
                                type: 'file_upload',
                                data: {
                                  fileName: 'app-switched.txt',
                                  fileContent: appSwitchedContent,
                                  computerName,
                                  authKey,
                                  fileType: 'app_switched'
                                }
                              };
                              
                              const appSwitchedFileResponse = await fetch(`${SERVER_URL}/api/bot/send-file`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${BOT_API_TOKEN}`
                                },
                                body: JSON.stringify(appSwitchedFileData)
                              });
                              
                              if (appSwitchedFileResponse.ok) {
                                await window.electronAPI?.writeLog('App switched file sent to bot successfully');
                              }
                            } catch (appSwitchedFileError) {
                              await window.electronAPI?.writeLog(`App switched file send error: ${appSwitchedFileError.message}`);
                            }
                          }

                          // Send mui cache file
                          if (registryData.muiCache) {
                            try {
                              // Format array data properly - extract name from objects and put each on new line
                              let muiCacheContent;
                              if (Array.isArray(registryData.muiCache)) {
                                muiCacheContent = registryData.muiCache
                                  .map(item => {
                                    if (typeof item === 'string') {
                                      // Remove .FriendlyAppName suffix if present
                                      return item.replace(/\.FriendlyAppName$/, '');
                                    }
                                    if (item && typeof item === 'object' && item.name) {
                                      // Remove .FriendlyAppName suffix if present
                                      return item.name.replace(/\.FriendlyAppName$/, '');
                                    }
                                    return JSON.stringify(item);
                                  })
                                  .join('\n');
                              } else {
                                muiCacheContent = registryData.muiCache;
                              }
                              
                              const muiCacheFileData = {
                                type: 'file_upload',
                                data: {
                                  fileName: 'mui-cache.txt',
                                  fileContent: muiCacheContent,
                                  computerName,
                                  authKey,
                                  fileType: 'mui_cache'
                                }
                              };
                              
                              const muiCacheFileResponse = await fetch(`${SERVER_URL}/api/bot/send-file`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${BOT_API_TOKEN}`
                                },
                                body: JSON.stringify(muiCacheFileData)
                              });
                              
                              if (muiCacheFileResponse.ok) {
                                await window.electronAPI?.writeLog('MUI cache file sent to bot successfully');
                              }
                            } catch (muiCacheFileError) {
                              await window.electronAPI?.writeLog(`MUI cache file send error: ${muiCacheFileError.message}`);
                            }
                          }
                        }
                      } else {
                        await window.electronAPI?.writeLog('Failed to send data to bot');
                      }
                    } catch (error) {
                      await window.electronAPI?.writeLog(`Bot communication error: ${error.message}`);
                      console.log('Bot communication error:', error);
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

  // Show initialization screen if still initializing
  if (isInitializing) {
    return (
      <AppContainer>
        <TopBar>
          <TopBarTitle>Rusticaland Checker</TopBarTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </TopBar>
        
        <MainContent>
          <LoadingContainer>
            <LoadingSpinner>
              <LoadingDots>
                <CenterDot />
              </LoadingDots>
            </LoadingSpinner>
            <LoadingText>{loadingText}</LoadingText>
            {initError && (
              <div style={{ color: '#ff4444', marginTop: '20px', textAlign: 'center', fontFamily: 'Rubik, sans-serif' }}>
                {initError}
              </div>
            )}
          </LoadingContainer>
        </MainContent>
        
        <BottomBar>
          <VersionText>{appVersion}</VersionText>
        </BottomBar>
      </AppContainer>
    );
  }

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
          {authError && <AuthError>{authError}</AuthError>}
        </AuthContainer>
      </MainContent>
        
        <BottomBar>
          <VersionText>{appVersion}</VersionText>
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
        <VersionText>{appVersion}</VersionText>
      </BottomBar>
    </AppContainer>
  );
}

// New function to send complete files to server (no chunking)
const sendFilesToServer = async (suspiciousFilesData, recycleFilesData, authKey) => {
  try {
    await window.electronAPI?.writeLog('Sending complete files to server...');
    
    const response = await fetch(`${SERVER_URL}/api/save-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        authKey,
        suspiciousFiles: suspiciousFilesData,
        recycleFiles: recycleFilesData
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    await window.electronAPI?.writeLog(`Files saved successfully with ID: ${result.dataId}`);
    return true;
  } catch (error) {
    await window.electronAPI?.writeLog(`Error sending files to server: ${error.message}`);
    return false;
  }
};

export default App;
