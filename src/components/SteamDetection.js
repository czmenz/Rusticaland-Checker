// Steam Detection Module for User Client checks
class SteamDetection {
  constructor() {
    this.steamApiKey = 'D28313B05592F0F80CF6BA35FDA673A6';
  }

  // Check if Steam is installed and get Steam path
  async getSteamPath() {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }
      
      const steamPath = await window.electronAPI.getRegistryValue(
        'HKEY_CURRENT_USER\\SOFTWARE\\Valve\\Steam',
        'SteamPath'
      );
      
      return steamPath;
    } catch (error) {
      console.error('Error getting Steam path:', error);
      return null;
    }
  }

  // Check if user owns original Rust
  async checkRustOwnership() {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }
      
      const rustKey = await window.electronAPI.getRegistryValue(
        'HKEY_CURRENT_USER\\SOFTWARE\\Valve\\Steam\\Apps\\252490',
        'Installed'
      );
      
      return rustKey === '1';
    } catch (error) {
      console.error('Error checking Rust ownership:', error);
      return false;
    }
  }

  // Parse loginusers.vdf file to get Steam accounts
  async getSteamAccounts(steamPath) {
    try {
      if (!steamPath || !window.electronAPI) {
        return [];
      }

      const vdfPath = `${steamPath}\\config\\loginusers.vdf`;
      const vdfContent = await window.electronAPI.readFile(vdfPath);
      
      return this.parseVdfAccounts(vdfContent);
    } catch (error) {
      console.error('Error reading loginusers.vdf:', error);
      return [];
    }
  }

  // Parse VDF content to extract account information
  parseVdfAccounts(vdfContent) {
    const accounts = [];
    
    try {
      // Simple regex to extract Steam IDs and account info
      const steamIdRegex = /"(\d{17})"/g;
      const accountNameRegex = /"AccountName"\s+"([^"]+)"/g;
      const personaNameRegex = /"PersonaName"\s+"([^"]+)"/g;
      const mostRecentRegex = /"MostRecent"\s+"([^"]+)"/g;
      
      let steamIdMatch;
      const steamIds = [];
      
      while ((steamIdMatch = steamIdRegex.exec(vdfContent)) !== null) {
        steamIds.push(steamIdMatch[1]);
      }
      
      // Extract account names
      let accountNameMatch;
      const accountNames = [];
      while ((accountNameMatch = accountNameRegex.exec(vdfContent)) !== null) {
        accountNames.push(accountNameMatch[1]);
      }
      
      // Extract persona names
      let personaNameMatch;
      const personaNames = [];
      while ((personaNameMatch = personaNameRegex.exec(vdfContent)) !== null) {
        personaNames.push(personaNameMatch[1]);
      }
      
      // Extract most recent flags
      let mostRecentMatch;
      const mostRecentFlags = [];
      while ((mostRecentMatch = mostRecentRegex.exec(vdfContent)) !== null) {
        mostRecentFlags.push(mostRecentMatch[1] === '1');
      }
      
      // Combine the data
      for (let i = 0; i < steamIds.length; i++) {
        accounts.push({
          steamId: steamIds[i],
          accountName: accountNames[i] || 'Unknown',
          personaName: personaNames[i] || 'Unknown',
          mostRecent: mostRecentFlags[i] || false
        });
      }
      
    } catch (error) {
      console.error('Error parsing VDF content:', error);
    }
    
    return accounts;
  }

  // Check Steam API for bans and account info
  async checkSteamAccountInfo(steamId) {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Steam API timeout')), 10000)
      );

      // Check for bans
      const banResponse = await Promise.race([
        fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${this.steamApiKey}&steamids=${steamId}`),
        timeoutPromise
      ]);
      const banData = await banResponse.json();
      
      // Get player summary for account creation date
      const summaryResponse = await Promise.race([
        fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.steamApiKey}&steamids=${steamId}`),
        timeoutPromise
      ]);
      const summaryData = await summaryResponse.json();
      
      const player = summaryData.response.players[0];
      const banInfo = banData.players[0];
      
      // Log player data for debugging
      await window.electronAPI?.writeLog(`Player data for ${steamId}: ${JSON.stringify(player)}`);
      
      // Calculate days since last ban if banned
      let daysSinceLastBan = null;
      if (banInfo.VACBanned || banInfo.NumberOfGameBans > 0) {
        if (banInfo.DaysSinceLastBan !== undefined) {
          daysSinceLastBan = banInfo.DaysSinceLastBan;
        }
      }
      
      return {
        steamId: steamId,
        banned: banInfo.VACBanned || banInfo.NumberOfGameBans > 0,
        vacBanned: banInfo.VACBanned,
        gameBans: banInfo.NumberOfGameBans,
        daysSinceLastBan: daysSinceLastBan,
        accountCreated: player && player.timecreated ? new Date(player.timecreated * 1000) : null,
        lastLogoff: player && player.lastlogoff ? new Date(player.lastlogoff * 1000) : null
      };
    } catch (error) {
      console.error(`Error checking Steam account ${steamId}:`, error);
      return {
        steamId: steamId,
        banned: false,
        vacBanned: false,
        gameBans: 0,
        daysSinceLastBan: null,
        accountCreated: null,
        lastLogoff: null,
        error: true
      };
    }
  }

  // Calculate years since account creation
  calculateAccountAge(createdDate) {
    if (!createdDate) return 'Unknown';
    
    const now = new Date();
    const years = Math.floor((now - createdDate) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (years === 0) {
      const months = Math.floor((now - createdDate) / (30.44 * 24 * 60 * 60 * 1000));
      return months === 0 ? 'Less than 1 month ago' : `${months} month${months > 1 ? 's' : ''} ago`;
    }
    
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }

  // Main function to perform complete User Client check
  async performUserClientCheck() {
    const results = {
      usingSteam: false,
      ownsRust: false,
      rustOwnerName: null,
      accounts: [],
      error: null
    };

    try {
      // Log detection start
      await window.electronAPI?.writeLog('Starting Steam detection process...');
      
      // Check Steam installation
      await window.electronAPI?.writeLog('Checking Steam installation...');
      const steamPath = await this.getSteamPath();
      results.usingSteam = !!steamPath;
      await window.electronAPI?.writeLog(`Steam path: ${steamPath || 'Not found'}`);
      
      if (!steamPath) {
        results.error = 'Steam not installed or not found';
        await window.electronAPI?.writeLog('Steam not found, ending detection');
        return results;
      }

      // Check Rust ownership
      await window.electronAPI?.writeLog('Checking Rust ownership...');
      results.ownsRust = await this.checkRustOwnership();
      await window.electronAPI?.writeLog(`Rust ownership: ${results.ownsRust}`);

      // Get Steam accounts
      await window.electronAPI?.writeLog('Getting Steam accounts...');
      const accounts = await this.getSteamAccounts(steamPath);
      await window.electronAPI?.writeLog(`Found ${accounts.length} Steam accounts`);
      
      // Check each account via Steam API
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        await window.electronAPI?.writeLog(`Checking account ${i + 1}/${accounts.length}: ${account.steamId}`);
        
        try {
          const apiInfo = await this.checkSteamAccountInfo(account.steamId);
          await window.electronAPI?.writeLog(`Account info received for ${account.steamId}: ${JSON.stringify(apiInfo)}`);
          
          const accountData = {
            ...account,
            ...apiInfo,
            accountAge: this.calculateAccountAge(apiInfo.accountCreated)
          };
          
          results.accounts.push(accountData);
          
          // If Rust is owned and we haven't set an owner yet, use the first account found
          if (results.ownsRust && !results.rustOwnerName) {
            results.rustOwnerName = account.personaName || account.accountName || 'Unknown';
          }
        } catch (error) {
          await window.electronAPI?.writeLog(`Error checking account ${account.steamId}: ${error.message}`);
          results.accounts.push({
            ...account,
            banned: false,
            error: true
          });
        }
      }

      await window.electronAPI?.writeLog('Steam detection completed successfully');

    } catch (error) {
      console.error('Error in User Client check:', error);
      await window.electronAPI?.writeLog(`Critical error in User Client check: ${error.message}`);
      results.error = error.message;
    }

    return results;
  }
}

export default SteamDetection;