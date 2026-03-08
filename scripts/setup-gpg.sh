#!/bin/bash
# Run this ONCE locally to generate your GPG signing key
# Then add the printed values as GitHub repository secrets

set -e

echo "=== Void IDE GPG Key Setup ==="
echo ""

# Generate a new GPG key (no passphrase for CI simplicity)
gpg --batch --gen-key <<EOF
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: Ronish Nadar
Name-Email: void-ide@ronishnadar.dev
Expire-Date: 0
%no-protection
EOF

# Get the key ID
KEY_ID=$(gpg --list-secret-keys --keyid-format LONG "void-ide@ronishnadar.dev" \
  | grep "^sec" | awk '{print $2}' | cut -d'/' -f2)

echo ""
echo "✓ GPG key generated: $KEY_ID"
echo ""
echo "========================================================"
echo "Add these as GitHub Repository Secrets:"
echo "(Settings → Secrets and variables → Actions → New secret)"
echo "========================================================"
echo ""
echo "Secret name:  GPG_KEY_ID"
echo "Secret value: $KEY_ID"
echo ""
echo "Secret name:  GPG_PASSPHRASE"
echo "Secret value: (leave empty — key has no passphrase)"
echo ""
echo "Secret name:  GPG_PRIVATE_KEY"
echo "Secret value:"
gpg --armor --export-secret-keys "$KEY_ID"
echo ""
echo "========================================================"
echo ""
echo "Public key saved to: void-ide.gpg"
gpg --armor --export "$KEY_ID" > void-ide.gpg
echo "Done! Commit and push, then tag a release:"
echo "  git tag v1.0.0 && git push origin v1.0.0"
