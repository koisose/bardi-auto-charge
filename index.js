"use strict";

var _tuyaConnectorNodejs = require("@tuya/tuya-connector-nodejs");
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const _require = require;
// Import our Rust functions
const {
  getSystemInfo,
  showNotification
} = require('./rust-addon/rust-addon.linux-x64-gnu.node');

// Load environment variables
_dotenv.default.config();
const baseUrl = process.env.TUYA_API_URL;
const accessKey = process.env.TUYA_ACCESS_KEY;
const secretKey = process.env.TUYA_ACCESS_SECRET;
if (!baseUrl || !accessKey || !secretKey) {
  throw new Error('Missing required environment variables');
}

// Initialize Tuya connector with v2
const tuya = new _tuyaConnectorNodejs.TuyaContext({
  baseUrl,
  accessKey,
  secretKey,
  version: 'v2'
});
async function turnOffSwitch4(trueOrFalse) {
  const res = await tuya.request({
    path: `/v1.0/iot-03/devices/${process.env.TUYA_POWER_STRIP_DEVICE_ID}/commands`,
    method: 'POST',
    body: {
      commands: [{
        code: "switch_4",
        value: trueOrFalse
      }]
    }
  });
  console.log(res);
}
async function main() {
  try {
    // Call our Rust function

    // Get system information
    const sysInfo = getSystemInfo();
    console.log('Raw system info:', sysInfo);
    if (sysInfo) {
      console.log('System Information:');
      console.log(`CPU Temperature: ${sysInfo.cpuTemp?.toFixed(1) || 'N/A'}°C`);
      console.log(`Battery: ${sysInfo.batteryPercentage?.toFixed(1) || 'N/A'}% (${sysInfo.batteryStatus || 'Unknown'})`);
    }

    // Test the connection by getting devices
    console.log('Testing Tuya connection...');

    // Get list of all devices using direct API request
    // showNotification("Tuya battery checker","checking", "normal");
    // const deviceDetail = await tuya.device.detail({device_id: process.env.TUYA_POWER_STRIP_DEVICE_ID});
    // console.log('Device Detail:', JSON.stringify(deviceDetail, null, 2));
    // const deviceCommand = await tuya.deviceFunction.specification({device_id: process.env.TUYA_POWER_STRIP_DEVICE_ID});
    // console.log('Device Detail:', JSON.stringify(deviceCommand, null, 2));
    // const deviceTurnOffOrOn = await tuya.deviceFunction.command({device_id: process.env.TUYA_POWER_STRIP_DEVICE_ID, commands: [{code:"switch_3",value:false}]});
    // console.log('Device Detail:', JSON.stringify(deviceTurnOffOrOn, null, 2));
    setInterval(async () => {
      showNotification("Tuya battery checker", "checking", "normal");
      const sysInfo = getSystemInfo();
      if (sysInfo.batteryPercentage?.toFixed(1) < 30) {
        await turnOffSwitch4(true);
        showNotification("Tuya charging", "charge", "normal");
      } else if (sysInfo.batteryPercentage?.toFixed(1) > 80) {
        await turnOffSwitch4(false);
        showNotification("Tuya discharging", "discharging", "normal");
      }
    }, 10 * 60 * 1000);
  } catch (error) {
    showNotification("Error", "something error with tuya", "critical");
    console.error('Error connecting to Tuya:', error);
  }
}
main();
