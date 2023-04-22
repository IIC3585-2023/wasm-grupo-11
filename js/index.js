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

const bestAssignmentToDict = (bestValue, assignment, clusterCount, jobCount, jobs) => {
    let retAssignment = [];
    for(let i = 0; i < clusterCount; i++){
        retAssignment.push([]);
    }
    costList = new Array(clusterCount);

    for(let i = 0; i < clusterCount; i++){
        costList[i] = 0;
    }

    for(let i = 0; i < jobCount; i++){
        retAssignment[assignment[i]].push(jobs[i]);
        costList[assignment[i]] += jobs[i];
    }

    let retList = []

    for(let i = 0; i < clusterCount; i++){
        retList.push({
            "cost": costList[i],
            "jobs": retAssignment[i]
        })
    }

    return [retList, bestValue]
}

const bruteForceAssignmentsC = (array, clusterCount) => {
    const list = Int32Array.from(array);
    const bestAssignment = Int32Array.from(new Array(array.length));
    // the iterative_randomized_greedy_assignements needs an array of ints as an argument,
    // so we allocate that before the function call
    const ptr = Module._malloc(list.byteLength);

    const assignmentPtr = Module._malloc(bestAssignment.byteLength);

    // Divide ptr by 4 (or shift-right by 2), because why???
    // I think it is because ptr considers an array of bytes, but we need
    // it to consider an array of int, which are 4-bytes long
    Module.HEAP32.set(list, ptr >> 2);

    Module.HEAP32.set(bestAssignment, assignmentPtr >> 2);

    const result = Module.ccall("bruteForceAssignments",
    'number',
    ['number', 'number', 'number'],
    [list.length, clusterCount, ptr, assignmentPtr]);

    let assignment = []
    for(let i = 0; i < array.length; i++){
        assignment.push(Module.getValue(assignmentPtr + 4*i, "i16"));
    }
    Module._free(ptr);
    Module._free(assignmentPtr);
    return bestAssignmentToDict(result, assignment, clusterCount, array.length, array)
}

Module.onRuntimeInitialized = () => {
    const runIterativeJS = document.getElementById("runIterativeJS");
    runIterativeJS.addEventListener("click", () => callSolver(instance.jobs, instance.clusters, iterativeRandomizedGreedyAssignments));
    const runBruteJS = document.getElementById("runBruteJS");
    runBruteJS.addEventListener("click", () => callSolver(instance.jobs, instance.clusters, bruteForceAssignments));
    const runBruteC = document.getElementById("runBruteC");
    runBruteC.addEventListener("click", () => callSolver(instance.jobs, instance.clusters, bruteForceAssignmentsC));

    document.getElementById("jobInput").addEventListener('change', (e) => getInput(e));
}

const callSolver = (jobs, clusters, solver) => {
    const [bestAssignments, bestCost] = solver(jobs, clusters);
    const result = {
        "cost": bestCost,
        "clusters": bestAssignments
    }
    console.log(result)
    download("result.json", JSON.stringify(result, null, 2))
}

const getInput = async (event) => {
    const file = event.target.files[0];
    const res = await file.text();
    const json = JSON.parse(res);
    
    instance = json
}

// const bruteForceAssignmentsC = (array, clusterCount) => {

//     const list = Int32Array.from(array);
//     // the iterative_randomized_greedy_assignements needs an array of ints as an argument,
//     // so we allocate that before the function call
//     const ptr = Module._malloc(list.byteLength);

//     // Divide ptr by 4 (or shift-right by 2), because why???
//     // I think it is because ptr considers an array of bytes, but we need
//     // it to consider an array of int, which are 4-bytes long
//     Module.HEAP32.set(list, ptr >> 2);

//     const result = Module.ccall("bruteForceAssignments",
//     'number',
//     ['number', 'number', 'number'],
//     [list.length, clusterCount, ptr]);

//     Module._free(ptr)
//     return result
// }

// const runAll = () => {

// }
