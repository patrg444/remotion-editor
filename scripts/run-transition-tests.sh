#!/bin/bash

# Function to clear cache and memory
clear_cache() {
  echo "Clearing cache and memory..."
  rm -rf ~/.cache/Cypress
  rm -rf cypress/screenshots/*
  sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
}

# Function to run a single test with retries
run_test() {
  local test_file=$1
  local max_retries=3
  local retry=0
  
  while [ $retry -lt $max_retries ]; do
    echo "Running $test_file (attempt $((retry + 1)) of $max_retries)..."
    
    # Clear cache before each attempt
    clear_cache
    
    # Run the test
    if npm run cypress:run -- --spec "cypress/integration/timeline/transitions/$test_file" --config video=false; then
      echo "Test $test_file passed!"
      return 0
    fi
    
    echo "Test failed, waiting before retry..."
    sleep 5
    ((retry++))
  done
  
  echo "Test $test_file failed after $max_retries attempts"
  return 1
}

# Main test sequence
echo "Starting transition tests..."

# Array of test files in order of complexity
test_files=(
  "transitions-creation.spec.ts"
  "transitions-types.spec.ts"
  "transitions-parameters.spec.ts"
  "transitions-webgl.spec.ts"
)

# Run each test file
failed_tests=()
for test_file in "${test_files[@]}"; do
  if ! run_test "$test_file"; then
    failed_tests+=("$test_file")
  fi
  
  # Wait between tests to allow memory cleanup
  sleep 2
done

# Report results
echo "Test run complete!"
if [ ${#failed_tests[@]} -eq 0 ]; then
  echo "All tests passed!"
  exit 0
else
  echo "The following tests failed:"
  printf '%s\n' "${failed_tests[@]}"
  exit 1
fi
