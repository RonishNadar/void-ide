#!/bin/bash
# Void IDE — post-install script
# Runs after `sudo dpkg -i void-ide_*.deb`

set -e

echo "Setting up Void IDE..."

# ── udev rules for Arduino USB access ────────────────────────────────────────
# Without this, users get "permission denied" on /dev/ttyUSB0 or /dev/ttyACM0

UDEV_RULES_FILE="/etc/udev/rules.d/99-void-ide-arduino.rules"

cat > "$UDEV_RULES_FILE" << 'UDEV'
# Void IDE — Arduino USB device rules
# Arduino Uno / Mega (ATmega16U2)
SUBSYSTEM=="usb", ATTR{idVendor}=="2341", MODE="0666", GROUP="dialout"
# Arduino Leonardo / Micro
SUBSYSTEM=="usb", ATTR{idVendor}=="2341", ATTR{idProduct}=="8036", MODE="0666", GROUP="dialout"
# Generic CH340 (common on cheap Nano clones)
SUBSYSTEM=="usb", ATTR{idVendor}=="1a86", ATTR{idProduct}=="7523", MODE="0666", GROUP="dialout"
# CP2102 (common USB-UART)
SUBSYSTEM=="usb", ATTR{idVendor}=="10c4", ATTR{idProduct}=="ea60", MODE="0666", GROUP="dialout"
# ESP32 / ESP8266 (Silicon Labs CP2104)
SUBSYSTEM=="usb", ATTR{idVendor}=="10c4", ATTR{idProduct}=="ea70", MODE="0666", GROUP="dialout"
UDEV

udevadm control --reload-rules 2>/dev/null || true
udevadm trigger            2>/dev/null || true

# ── Add current user to dialout group ────────────────────────────────────────
# Needed to access /dev/ttyUSB0 and /dev/ttyACM0 without sudo
REAL_USER="${SUDO_USER:-$USER}"
if [ -n "$REAL_USER" ] && [ "$REAL_USER" != "root" ]; then
  usermod -aG dialout "$REAL_USER" 2>/dev/null || true
  echo "Added '$REAL_USER' to the dialout group."
  echo "NOTE: Log out and back in for serial port access to take effect."
fi

# ── Create default sketches folder ───────────────────────────────────────────
SKETCH_DIR="/home/$REAL_USER/VoidSketches"
if [ ! -d "$SKETCH_DIR" ]; then
  mkdir -p "$SKETCH_DIR"
  chown "$REAL_USER:$REAL_USER" "$SKETCH_DIR" 2>/dev/null || true
fi

echo "Void IDE installed successfully."
echo "Launch it from the Applications menu or run: void-ide"

# ── Patch .desktop to add --no-sandbox ───────────────────────────────────────
DESKTOP_FILE="/usr/share/applications/void-ide.desktop"
if [ -f "$DESKTOP_FILE" ]; then
  sed -i '/^Exec=/ s|$| --no-sandbox|' "$DESKTOP_FILE"
  update-desktop-database /usr/share/applications/ 2>/dev/null || true
fi

echo "Void IDE installed successfully."
echo "Launch it from the Applications menu or run: void-ide"
