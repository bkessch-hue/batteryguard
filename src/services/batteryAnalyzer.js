import { BATTERY_STATUS, VOLTAGE_RANGES } from '../utils/constants';

class BatteryAnalyzer {
  static getHealthPercent(voltage, cca = null, designCca = null) {
    let health = 0;
    if (voltage >= 12.6) health = 100;
    else if (voltage >= 12.4) health = 85;
    else if (voltage >= 12.2) health = 70;
    else if (voltage >= 12.0) health = 55;
    else if (voltage >= 11.8) health = 35;
    else if (voltage >= 11.5) health = 15;
    else health = 5;

    if (cca && designCca) {
      const ccaPercent = (cca / designCca) * 100;
      health = health * 0.7 + ccaPercent * 0.3;
    }

    return Math.min(100, Math.max(0, Math.round(health)));
  }

  static getStatus(healthPercent) {
    if (healthPercent >= 90) return BATTERY_STATUS.EXCELLENT;
    if (healthPercent >= 70) return BATTERY_STATUS.GOOD;
    if (healthPercent >= 50) return BATTERY_STATUS.FAIR;
    if (healthPercent >= 30) return BATTERY_STATUS.POOR;
    if (healthPercent >= 15) return BATTERY_STATUS.CRITICAL;
    return BATTERY_STATUS.DEAD;
  }

  static getVoltageStatus(voltage) {
    if (voltage >= 12.9) return VOLTAGE_RANGES.OVERCHARGING;
    if (voltage >= 12.6) return VOLTAGE_RANGES.EXCELLENT;
    if (voltage >= 12.4) return VOLTAGE_RANGES.GOOD;
    if (voltage >= 12.2) return VOLTAGE_RANGES.FAIR;
    if (voltage >= 12.0) return VOLTAGE_RANGES.LOW;
    if (voltage >= 11.8) return VOLTAGE_RANGES.CRITICAL;
    return VOLTAGE_RANGES.DEAD;
  }

  static predictRemainingLife(voltage, cca, designCca, batteryAgeMonths) {
    const health = this.getHealthPercent(voltage, cca, designCca);
    const ageFactor = Math.max(0, 1 - (batteryAgeMonths / 60));

    let score = health * 0.6 + ageFactor * 100 * 0.4;
    let estimatedMonths = Math.round(score * 0.6);

    if (voltage < 12.0) estimatedMonths = Math.min(estimatedMonths, 3);
    if (health < 30) estimatedMonths = Math.min(estimatedMonths, 2);

    return {
      estimatedMonths,
      confidence: cca ? 'high' : 'medium',
      recommendation: score < 30 ? 'REPLACE_NOW' : score < 60 ? 'REPLACE_SOON' : 'GOOD_CONDITION',
    };
  }

  static analyzeChargeSystem(alternatorVoltage) {
    if (alternatorVoltage >= 13.8 && alternatorVoltage <= 14.5) {
      return { status: 'normal', label: 'Charging System Normal', color: '#00E676' };
    } else if (alternatorVoltage >= 13.0 && alternatorVoltage < 13.8) {
      return { status: 'low', label: 'Low Charging Output', color: '#FF9100' };
    } else if (alternatorVoltage > 14.5) {
      return { status: 'high', label: 'Overcharging Detected', color: '#FF1744' };
    } else {
      return { status: 'fail', label: 'Charging System Failure', color: '#FF1744' };
    }
  }

  static generateReport(scanData, vehicle) {
    const health = this.getHealthPercent(scanData.voltage, scanData.cca, vehicle.designCca);
    const status = this.getStatus(health);
    const voltageStatus = this.getVoltageStatus(scanData.voltage);
    const prediction = this.predictRemainingLife(scanData.voltage, scanData.cca, vehicle.designCca, vehicle.batteryAgeMonths);

    return {
      timestamp: new Date().toISOString(),
      vehicle: vehicle.name,
      batteryHealth: health,
      status,
      voltage: scanData.voltage,
      voltageStatus,
      cca: scanData.cca || null,
      temperature: scanData.temperature || null,
      prediction,
      recommendation: this.getRecommendation(health, prediction),
    };
  }

  static getRecommendation(health, prediction) {
    if (health < 15) return 'Your battery is critically low and needs immediate replacement.';
    if (health < 30) return 'Your battery is failing. Plan to replace it within the next few weeks.';
    if (health < 50) return 'Your battery is deteriorating. Consider replacement soon.';
    if (health < 70) return 'Your battery is fair. Monitor it closely and consider replacement within months.';
    if (health < 90) return 'Your battery is in good condition. Continue regular monitoring.';
    return 'Your battery is in excellent condition. No action needed.';
  }
}

export default BatteryAnalyzer;
