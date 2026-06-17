#!/usr/bin/env bash
# 伙伴提交前自检：与 MR 检查相同，未通过则 exit 1
set -euo pipefail
"$(dirname "$0")/java-review.sh" "$@"
