#![deny(clippy::all)]

use napi_derive::napi;
use sysinfo::{System, SystemExt, ComponentExt};
use serde::Serialize;
use std::fs;
use notify_rust::Notification;

#[derive(Serialize)]
struct SystemInfo {
    cpu_temp: f32,
    battery_percentage: f32,
    battery_status: String,
}

#[napi(object)]
pub struct JsSystemInfo {
    #[napi(js_name = "cpuTemp")]
    pub cpu_temp: f64,
    #[napi(js_name = "batteryPercentage")]
    pub battery_percentage: f64,
    #[napi(js_name = "batteryStatus")]
    pub battery_status: String,
}

#[napi(js_name = "sayHello")]
pub fn say_hello() -> napi::Result<String> {
    Ok("hello".to_string())
}

#[napi(js_name = "getSystemInfo")]
pub fn get_system_info() -> napi::Result<JsSystemInfo> {
    let mut sys = System::new_all();
    sys.refresh_all();

    // Get CPU temperature (average of all components)
    let cpu_temp = if sys.components().is_empty() {
        // Try reading from /sys/class/thermal/thermal_zone0/temp
        std::fs::read_to_string("/sys/class/thermal/thermal_zone0/temp")
            .map(|s| s.trim().parse::<f64>().map(|t| t / 1000.0).unwrap_or(0.0))
            .unwrap_or(0.0)
    } else {
        sys.components()
            .iter()
            .map(|comp| comp.temperature())
            .sum::<f32>() as f64 / sys.components().len() as f64
    };

    // Get battery information from /sys/class/power_supply
    let battery_percentage = std::fs::read_to_string("/sys/class/power_supply/BAT0/capacity")
        .map(|s| s.trim().parse::<f64>().unwrap_or(0.0))
        .unwrap_or(0.0);

    let battery_status = std::fs::read_to_string("/sys/class/power_supply/BAT0/status")
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|_| "Unknown".to_string());

    Ok(JsSystemInfo {
        cpu_temp,
        battery_percentage,
        battery_status,
    })
}

#[napi]
pub fn show_notification(title: String, message: String, urgency: String) -> bool {
    let urgency_level = match urgency.as_str() {
        "low" => notify_rust::Urgency::Low,
        "critical" => notify_rust::Urgency::Critical,
        _ => notify_rust::Urgency::Normal,
    };

    match Notification::new()
        .summary(&title)
        .body(&message)
        .urgency(urgency_level)
        .show() {
            Ok(_) => true,
            Err(_) => false,
        }
}
