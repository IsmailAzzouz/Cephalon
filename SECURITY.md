# Security policy

Céphalon is a prototype. There are no stable releases or supported legacy
branches yet; fixes target the current `main` branch.

## Report a vulnerability

If GitHub private vulnerability reporting is available for this repository, use
[Report a vulnerability](https://github.com/IsmailAzzouz/Cephalon/security/advisories/new).
If it is unavailable, use a private contact method published on the
[maintainer’s profile](https://github.com/IsmailAzzouz). If no private route is
listed, open an issue requesting one without including vulnerability details.

Include the affected commit, reproduction steps, expected impact and a minimal
example with sensitive information removed. Do not include API keys, recordings
of private conversations or personal data. No response-time guarantee or bounty
program is offered.

## Current scope

The browser playground runs locally. Its development server has no authentication;
use `--host 127.0.0.1` for access from one computer and expose it only on a trusted
network when testing from another device. It is not a production server.

The resident host, wake-word listener, computer-use specialist and connected agent
runtime are not implemented. Their security properties have not been evaluated.
