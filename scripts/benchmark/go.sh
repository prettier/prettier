#!/usr/bin/env bash

commits=("${@}")

function cleanup {
  echo Cleaning up...
  rm -rf "${commits[@]}"
  echo Done!
}
trap cleanup EXIT

args=()

for commit in "${commits[@]}"; do
  rm -rf $commit
  git -C ../.. archive $commit --prefix $commit/ ':!tests*' ':!website' ':!docs' | tar -x
  (cd $commit; yarn; yarn build; rm -rf node_modules)
  args+=("node ./bench.mjs $commit serial")
  args+=("node ./bench.mjs $commit parallel")
done

hyperfine --warmup 3 "${args[@]}"
