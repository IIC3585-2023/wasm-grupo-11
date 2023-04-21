let instance = {
    "clusters": 2,
    "jobs": [1,2,3,4,5,6,7,8,9,10]
}

function download(filename, text) {
    let a = document.createElement('a');
    a.href = "data:application/octet-stream,"+encodeURIComponent(text);
    a.download = filename;
    a.click();
}

Module.onRuntimeInitialized = () => {
    const runIterativeJS = document.getElementById("runIterativeJS");
    runIterativeJS.addEventListener("click", () => callSolver(instance.jobs, instance.clusters, iterativeRandomizedGreedyAssignments));
    const runBruteJS = document.getElementById("runBruteJS");
    runBruteJS.addEventListener("click", () => callSolver(instance.jobs, instance.clusters, bruteForceAssignments));

    document.getElementById("jobInput").addEventListener('change', (e) => getInput(e));
}

const callSolver = (jobs, clusters, solver) => {
    const [bestAssignments, bestCost] = solver(jobs, clusters);
    const result = {
        "cost": bestCost,
        "clusters": bestAssignments
    }
    download("result.json", JSON.stringify(result, null, 2))
}

const getInput = async (event) => {
    const file = event.target.files[0];
    const res = await file.text();
    const json = JSON.parse(res);
    
    instance = json
}

const iterativeRandomizedGreedyAssignmentsC = (array, clusterCount) => {
    const list = Int32Array.from(array);
    // the iterative_randomized_greedy_assignements needs an array of ints as an argument,
    // so we allocate that before the function call
    const ptr = Module._malloc(list.byteLength);

    // Divide ptr by 4 (or shift-right by 2), because why???
    // I think it is because ptr considers an array of bytes, but we need
    // it to consider an array of int, which are 4-bytes long
    Module.HEAP32.set(list, ptr >> 2);

    const result = Module.ccall("iterative_randomized_greedy_assignements",
    'number',
    ['number', 'number', 'number'],
    [list.length, clusterCount, ptr]);

    Module._free(ptr)
    return result
}

const bruteForceAssignmentsC = (array, clusterCount) => {

    const list = Int32Array.from(array);
    // the iterative_randomized_greedy_assignements needs an array of ints as an argument,
    // so we allocate that before the function call
    const ptr = Module._malloc(list.byteLength);

    // Divide ptr by 4 (or shift-right by 2), because why???
    // I think it is because ptr considers an array of bytes, but we need
    // it to consider an array of int, which are 4-bytes long
    Module.HEAP32.set(list, ptr >> 2);

    const result = Module.ccall("bruteForceAssignments",
    'number',
    ['number', 'number', 'number'],
    [list.length, clusterCount, ptr]);

    Module._free(ptr)
    return result
}

const runAll = () => {

}
