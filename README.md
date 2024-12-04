# Tuya Battery Monitor

A Node.js application that monitors your system's battery level and automatically controls a Tuya smart plug to manage charging. When the battery level drops below 30%, it turns on the smart plug to start charging, and when it reaches 80%, it turns off the plug to prevent overcharging.

## Features

- Real-time battery level monitoring
- Automatic smart plug control based on battery levels
- Desktop notifications for battery status
- Systemd service integration for automatic startup
- Built with Rust native addon for system information

## Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Rust toolchain (for native addon compilation)
- Linux system with systemd
- Tuya smart plug and API credentials

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd tuya
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the project root with your Tuya credentials:
```env
TUYA_API_URL=your_api_url
TUYA_ACCESS_KEY=your_access_key
TUYA_ACCESS_SECRET=your_secret_key
TUYA_POWER_STRIP_DEVICE_ID=your_device_id
```

## Building

1. Build the Rust addon:
```bash
pnpm build:rust
```

2. Build the application:
```bash
pnpm build
```

This will create an executable named `tuya-monitor` in your project directory.

## Running

### Manual Run

You can run the application directly:
```bash
./tuya-monitor
```

### Running as a System Service

#### Setting up the Systemd Service

1. Create a `tuya-monitor.service` file with the following content:
```ini
[Unit]
Description=Tuya Battery Monitor Service
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/tuya/directory
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

2. Copy the service file to systemd directory:
```bash
sudo cp tuya-monitor.service /etc/systemd/system/
```

3. Reload systemd daemon and enable the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tuya-monitor
sudo systemctl start tuya-monitor
```

4. Check service status:
```bash
sudo systemctl status tuya-monitor
```

#### Service Management

- Check service status:
```bash
sudo systemctl status tuya-monitor
```

- Stop the service:
```bash
sudo systemctl stop tuya-monitor
```

- View logs:
```bash
sudo journalctl -u tuya-monitor
```

## Configuration

The application monitors battery levels with the following thresholds:
- Below 30%: Turns ON the smart plug to start charging
- Above 80%: Turns OFF the smart plug to prevent overcharging
- Checks every 10 minutes

To modify these thresholds, edit the values in `index.mjs`.

## Development

The project uses:
- ES6+ JavaScript (transpiled to ES5)
- Rust for native system information
- Babel for transpilation
- pkg for binary creation

To modify the code:
1. Make changes to `index.mjs`
2. Run `pnpm build` to create a new binary
3. Restart the service if running: `sudo systemctl restart tuya-monitor`

## Troubleshooting

1. If the service fails to start, check the logs:
```bash
sudo journalctl -u tuya-monitor -f
```

2. Verify environment variables:
```bash
sudo systemctl show tuya-monitor
```

3. Check file permissions:
```bash
ls -l tuya-monitor
```

## License

ISC License
