
#!/usr/bin/env bash

set -e

git fetch origin

set +e
remote_ref=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
set -e

[[ $remote_ref == '@{u}' ]] && echo $(git merge-base head origin/master) && exit 0

echo ${remote_ref:-$(git merge-base head origin/master)}

