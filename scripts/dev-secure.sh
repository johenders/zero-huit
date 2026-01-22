#!/usr/bin/env bash
set -euo pipefail

# Secure alternative to NODE_TLS_REJECT_UNAUTHORIZED=0
# Uses Homebrew's CA bundle when available.

# Ensure `#!/usr/bin/env node` resolves to the same Node binary used by npm.
if [[ -n "${npm_node_execpath:-}" ]] && [[ -x "${npm_node_execpath:-}" ]]; then
  export PATH="$(dirname "$npm_node_execpath"):$PATH"
fi

if [[ -z "${SSL_CERT_FILE:-}" ]]; then
  if [[ -f "/opt/homebrew/opt/ca-certificates/share/ca-certificates/cacert.pem" ]]; then
    export SSL_CERT_FILE="/opt/homebrew/opt/ca-certificates/share/ca-certificates/cacert.pem"
  elif [[ -f "/opt/homebrew/etc/openssl@3/cert.pem" ]]; then
    export SSL_CERT_FILE="/opt/homebrew/etc/openssl@3/cert.pem"
  elif [[ -f "/etc/ssl/cert.pem" ]]; then
    export SSL_CERT_FILE="/etc/ssl/cert.pem"
  fi
fi

# Undici/Node TLS also supports NODE_EXTRA_CA_CERTS; point it to the same bundle.
if [[ -z "${NODE_EXTRA_CA_CERTS:-}" ]] && [[ -n "${SSL_CERT_FILE:-}" ]] && [[ -f "${SSL_CERT_FILE}" ]]; then
  export NODE_EXTRA_CA_CERTS="${SSL_CERT_FILE}"
fi

# Tell Node to use OpenSSL CA store (pointed by SSL_CERT_FILE).
if [[ "${NODE_OPTIONS:-}" != *"--use-openssl-ca"* ]]; then
  export NODE_OPTIONS="${NODE_OPTIONS:-} --use-openssl-ca"
fi

exec "./node_modules/.bin/next" dev --webpack
