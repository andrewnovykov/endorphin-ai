task 1: fix test recorder
# Start interactive test recorder
endorphin run test-recorder
# Record a specific site
endorphin run test-recorder --site https://example.com

task 2:
# Modern equivalent (should be implemented)
endorphin validate tests/
endorphin validate tests/my-test.js