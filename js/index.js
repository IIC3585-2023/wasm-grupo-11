Module.onRuntimeInitialized = () => {
    
    // Random list must be an Int32Array, a normal list wont work for ccall
    const randomList = Int32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    console.log(randomList.byteLength)

    // the iterative_randomized_greedy_assignements needs an array of ints as an argument,
    // so we allocate that before the function call
    const ptr = Module._malloc(randomList.byteLength)
    // Divide ptr by 4 (or shift-right by 2), because why???
    // I think it is because ptr considers an array of bytes, but we need
    // it to consider an array of int, which are 4-bytes long
    Module.HEAP32.set(randomList, ptr >> 2)
 
    // Call function with ccall.
    // First, give the name of the function to call.
    // Then, the return type of the function.
    // Then, the types of the arguments received by the funcion (a pointer is
    // is treated as the same type, i.e. if the function takes a pointer to int,
    // then the type is just number)
    // Finally, give the arguments of the function.
    const result = Module.ccall("iterative_randomized_greedy_assignements",
        'number',
        ['number', 'number', 'number'],
        [randomList.length, 2, ptr]
    )

    // Lastly, free the allocated memory
    Module._free(ptr)

    console.log(result)
}
