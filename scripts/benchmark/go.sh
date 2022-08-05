#!/usr/bin/env bash

commits=("${@}")

args=()

for commit in "${commits[@]}"; do
  rm -rf $commit
  git -C ../.. archive $commit --prefix $commit/ | tar -x
  (cd $commit; yarn; yarn build)
  args+=("node ./bench.mjs $commit serial")
  args+=("node ./bench.mjs $commit parallel")
done

hyperfine "${args[@]}"

for commit in "${commits[@]}"; do
  rm -rf $commit
done
