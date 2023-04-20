Module.onRuntimeInitialized = () => {
    
    const randomList = Int32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    console.log(randomList.byteLength)

    const ptr = Module._malloc(randomList.byteLength)
    Module.HEAP32.set(randomList, ptr >> 2)

    const result = Module.ccall("iterative_randomized_greedy_assignements",
        'number',
        ['number', 'number', 'number'],
        [randomList.length, 1, ptr]
    )

    console.log(result)
}
