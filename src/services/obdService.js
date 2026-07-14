import { OBD_PIDS } from '../utils/constants';
import { Platform } from 'react-native';

let BleManager = null;
if (Platform.OS !== 'web') {
  try {
    BleManager = require('react-native-ble-plx').BleManager;
  } catch (e) {}
}

const OBD_DEVICE_KEYWORDS = [
  'OBD', 'ELM', 'obd', 'elm', 'OBDII', 'obdii',
  'VEEPEAK', 'Veepeak', 'veepeak',
  'BAFX', 'Bafx', 'bafx',
  'KONNWEI', 'Konnwei', 'konnwei',
  'FIXD', 'Fixd', 'fixd',
  'CARISTA', 'Carista', 'carista',
  'BLUE', 'INNODB', 'ScanTool', 'OBDLink',
  'Vgate', 'vgate', 'LE LINK', 'Link',
  'NEXAS', 'Nexas', 'Autel', 'Autel',
  'DURATEL', 'Mestek', 'Foxwell',
];

class OBDService {
  constructor() {
    this.manager = BleManager ? new BleManager() : null;
    this.device = null;
    this.isConnected = false;
    this.isWeb = Platform.OS === 'web';
    this.vehicleInfo = null;
    this.supportedPids = null;
  }

  async requestPermissions() {
    if (Platform.OS === 'ios') return true;
    const { PermissionsAndroid } = require('react-native');
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
  }

  isOBDDevice(device) {
    const name = (device.name || '').toLowerCase();
    const localName = (device.localName || '').toLowerCase();
    return OBD_DEVICE_KEYWORDS.some(kw =>
      name.includes(kw.toLowerCase()) || localName.includes(kw.toLowerCase())
    );
  }

  async scanForDevices() {
    if (this.isWeb || !this.manager) {
      return [
        { id: 'demo-obd-001', name: 'Demo OBD-II Adapter', localName: 'ELM327 Demo' },
        { id: 'demo-obd-002', name: 'Veepeak Mini', localName: 'VEEPEAK' },
        { id: 'demo-obd-003', name: 'KONNWEI KW310', localName: 'KONNWEI' },
      ];
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error('Bluetooth permissions not granted');

    return new Promise((resolve, reject) => {
      const devices = [];
      const timeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        resolve(devices);
      }, 12000);

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timeout);
          reject(error);
          return;
        }
        if (device && !devices.find(d => d.id === device.id)) {
          devices.push(device);
        }
      });
    });
  }

  async connectToDevice(device) {
    if (this.isWeb) {
      this.device = device;
      this.isConnected = true;
      this.vehicleInfo = { detected: true, name: device.name || 'Unknown Vehicle' };
      return device;
    }

    this.device = await device.connect();
    this.isConnected = true;
    await this.device.discoverAllServicesAndCharacteristics();
    return this.device;
  }

  async initializeOBD() {
    if (this.isWeb) {
      this.vehicleInfo = { detected: true, protocol: 'Demo' };
      return;
    }
    if (!this.device) throw new Error('No device connected');

    await this.sendCommand('ATZ');
    await this.sendCommand('ATE0');
    await this.sendCommand('ATSP0');

    const pidResponse = await this.sendCommand('0100');
    this.supportedPids = pidResponse;

    this.vehicleInfo = await this.detectVehicle();
  }

  async detectVehicle() {
    const vinResponse = await this.sendCommand('0902');
    const vin = this.parseVIN(vinResponse);

    return {
      detected: true,
      vin: vin || null,
      protocol: 'OBD-II',
    };
  }

  parseVIN(response) {
    try {
      const hex = response.replace(/[^0-9A-Fa-f]/g, '');
      const vinChars = [];
      for (let i = 0; i < hex.length && vinChars.length < 17; i += 2) {
        const code = parseInt(hex.substr(i, 2), 16);
        if (code >= 32 && code <= 126) {
          vinChars.push(String.fromCharCode(code));
        }
      }
      const vin = vinChars.join('');
      return vin.length === 17 ? vin : null;
    } catch {
      return null;
    }
  }

  async sendCommand(command) {
    if (this.isWeb) return '';
    if (!this.device) throw new Error('No device connected');

    const services = await this.device.services();
    let writeChar = null;
    let notifyChar = null;

    for (const service of services) {
      const characteristics = await service.characteristics();
      for (const char of characteristics) {
        if (char.isWritableWithoutResponse || char.isWritable) {
          writeChar = char;
        }
        if (char.isNotifiable) {
          notifyChar = char;
        }
      }
    }

    if (!writeChar) throw new Error('Could not find write characteristic');

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Response timeout')), 5000);
      const responses = [];

      const subscription = notifyChar?.monitor((error, char) => {
        if (error) {
          clearTimeout(timeout);
          reject(error);
          return;
        }
        const data = char?.value;
        if (data) {
          const decoded = atob(data);
          responses.push(decoded);
          if (decoded.includes('>')) {
            clearTimeout(timeout);
            subscription?.remove();
            resolve(responses.join(''));
          }
        }
      });

      writeChar.writeWithoutResponse(btoa(command + '\r'));
    });
  }

  async readBatteryVoltage() {
    const response = await this.sendCommand(OBD_PIDS.BATTERY_VOLTAGE);
    return this.parseVoltage(response);
  }

  async readBatterySOC() {
    const response = await this.sendCommand(OBD_PIDS.BATTERY_SOC);
    return this.parseSOC(response);
  }

  async readAmbientTemp() {
    const response = await this.sendCommand(OBD_PIDS.AMBIENT_TEMP);
    return this.parseTemperature(response);
  }

  async readEngineRPM() {
    const response = await this.sendCommand(OBD_PIDS.ENGINE_RPM);
    return this.parseRPM(response);
  }

  async readChargingVoltage() {
    const response = await this.sendCommand(OBD_PIDS.CONTROL_MODULE_VOLTAGE);
    return this.parseChargingVoltage(response);
  }

  async readCoolantTemp() {
    const response = await this.sendCommand(OBD_PIDS.COOLANT_TEMP);
    try {
      const match = response.match(/05\s+([0-9A-F]{2})/);
      if (match) return parseInt(match[1], 16) - 40;
      return null;
    } catch { return null; }
  }

  parseVoltage(response) {
    try {
      const match = response.match(/42\s+([0-9A-F]{2})([0-9A-F]{2})/);
      if (match) return (parseInt(match[1], 16) * 256 + parseInt(match[2], 16)) / 1000;
      return null;
    } catch { return null; }
  }

  parseSOC(response) {
    try {
      const match = response.match(/5B\s+([0-9A-F]{2})/);
      if (match) return Math.round(parseInt(match[1], 16) / 2.55);
      return null;
    } catch { return null; }
  }

  parseTemperature(response) {
    try {
      const match = response.match(/46\s+([0-9A-F]{2})/);
      if (match) return parseInt(match[1], 16) - 40;
      return null;
    } catch { return null; }
  }

  parseRPM(response) {
    try {
      const match = response.match(/0C\s+([0-9A-F]{2})([0-9A-F]{2})/);
      if (match) return Math.round((parseInt(match[1], 16) * 256 + parseInt(match[2], 16)) / 4);
      return null;
    } catch { return null; }
  }

  parseChargingVoltage(response) {
    try {
      const match = response.match(/42\s+([0-9A-F]{2})([0-9A-F]{2})/);
      if (match) return (parseInt(match[1], 16) * 256 + parseInt(match[2], 16)) / 1000;
      return null;
    } catch { return null; }
  }

  async performFullScan() {
    const voltage = await this.readBatteryVoltage();
    const soc = await this.readBatterySOC();
    const ambientTemp = await this.readAmbientTemp();
    const engineRPM = await this.readEngineRPM();
    const chargingVoltage = await this.readChargingVoltage();
    const coolantTemp = await this.readCoolantTemp();

    return {
      voltage,
      soc,
      ambientTemp,
      engineRPM,
      chargingVoltage,
      coolantTemp,
      vehicleInfo: this.vehicleInfo,
      timestamp: new Date().toISOString(),
    };
  }

  disconnect() {
    if (this.device) {
      if (!this.isWeb && this.device.cancelConnection) {
        this.device.cancelConnection();
      }
      this.device = null;
      this.isConnected = false;
      this.vehicleInfo = null;
    }
  }

  destroy() {
    this.disconnect();
    if (this.manager) this.manager.destroy();
  }
}

export default new OBDService();
