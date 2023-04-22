#!/usr/bin/env bash

emcc -sEXPORTED_FUNCTIONS=_iterative_randomized_greedy_assignements,_bruteForceAssignments,_malloc,_free -sEXPORTED_RUNTIME_METHODS=ccall,getValue -O0 c/main.c -o cClusters.js

mv cClusters.js cClusters.wasm ./js