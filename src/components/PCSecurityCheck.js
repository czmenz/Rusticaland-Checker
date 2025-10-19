class PCSecurityCheck {
  constructor() {
    this.services = [
      { name: 'EventLog', displayName: 'Windows Event Log' },
      { name: 'WinDefend', displayName: 'Windows Defender Antivirus' },
      { name: 'MpsSvc', displayName: 'Microsoft Defender Firewall' },
      { name: 'EasyAntiCheat', displayName: 'Easy Anti-Cheat' },
      { name: 'wuauserv', displayName: 'Windows Update' },
      { name: 'wscsvc', displayName: 'Windows Security Center' },
      { name: 'Wecsvc', displayName: 'Event Forwarding/Collector' }
    ];
  }

  async checkService(serviceName) {
    try {
      const status = await window.electronAPI.checkService(serviceName);
      return status;
    } catch (error) {
      console.error(`Error checking service ${serviceName}:`, error);
      return 'Error';
    }
  }

  async checkDefenderTamperProtection() {
    try {
      const status = await window.electronAPI.checkDefenderTamperProtection();
      return status;
    } catch (error) {
      console.error('Error checking Defender Tamper Protection:', error);
      return 'Error';
    }
  }

  async checkEasyAntiCheat() {
    try {
      const status = await window.electronAPI.checkEasyAntiCheat();
      return status;
    } catch (error) {
      console.error('Error checking Easy Anti-Cheat:', error);
      return 'Error';
    }
  }

  async backupEventLogs() {
    try {
      const backupPaths = await window.electronAPI.backupEventLogs();
      return backupPaths;
    } catch (error) {
      console.error('Error backing up event logs:', error);
      return [];
    }
  }

  async backupEACLogs() {
    try {
      const backupPaths = await window.electronAPI.backupEACLogs();
      return backupPaths;
    } catch (error) {
      console.error('Error backing up EAC logs:', error);
      return [];
    }
  }

  async performPCSecurityCheck() {
    const results = {
      services: {},
      tamperProtection: 'Unknown',
      easyAntiCheat: 'Unknown',
      eventLogBackups: [],
      eacLogBackups: [],
      sysmonEDR: 'Not Implemented' // Placeholder for future implementation
    };

    // Check all services
    for (const service of this.services) {
      if (service.name === 'EasyAntiCheat') {
        results.services[service.name] = await this.checkEasyAntiCheat();
      } else {
        results.services[service.name] = await this.checkService(service.name);
      }
    }

    // Check Defender Tamper Protection
    results.tamperProtection = await this.checkDefenderTamperProtection();

    // Backup event logs
    results.eventLogBackups = await this.backupEventLogs();

    // Backup EAC logs
    results.eacLogBackups = await this.backupEACLogs();

    return results;
  }

  getServiceDisplayName(serviceName) {
    const service = this.services.find(s => s.name === serviceName);
    return service ? service.displayName : serviceName;
  }
}

export default PCSecurityCheck;