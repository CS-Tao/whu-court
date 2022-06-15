
#!/usr/bin/env bash

set +e

remote_ref=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)

echo ${remote_ref:-$(git merge-base head origin/master)}

set -e
