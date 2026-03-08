#!/bin/bash
# Void IDE — post-remove script

set -e

# Remove udev rules
rm -f /etc/udev/rules.d/99-void-ide-arduino.rules
udevadm control --reload-rules 2>/dev/null || true

echo "Void IDE removed."
