let instance = {
    "clusters": 2,
    "jobs": [1,2,3,4,5,6,7,8,9,10]
}

const generateRandomInstance = () => {
    const clusterInput = document.getElementById("clustersInput").value;
    const jobCountInput = document.getElementById("jobCountInput").value;
    console.log(jobCountInput)
    
    let newInstance = {
        clusters: clusterInput,
        // Generate a random list of numbers, obtained
        // from https://stackoverflow.com/questions/5836833/create-an-array-with-random-values
        jobs: Array.from({length: jobCountInput}).map( (el) => Math.floor(Math.random() * 1000) )
    }
    instance = newInstance;
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
    // the bruteForceAssignments needs arrays of ints as arguments,
    // so we allocate that before the function call
    const ptr = Module._malloc(list.byteLength);
    const assignmentPtr = Module._malloc(bestAssignment.byteLength);

    // Divide ptr by 4 (or shift-right by 2), because why???
    // I think it is because ptr considers an array of bytes, but we need
    // it to consider an array of int, which are 4-bytes long
    Module.HEAP32.set(list, ptr >> 2);
    Module.HEAP32.set(bestAssignment, assignmentPtr >> 2);

    const start = performance.now();
    const result = Module.ccall("bruteForceAssignments",
        'number',
        ['number', 'number', 'number', 'number'],
        [list.length, clusterCount, ptr, assignmentPtr]
    );
    const end = performance.now();

    let assignment = []
    for(let i = 0; i < array.length; i++){
        assignment.push(Module.getValue(assignmentPtr + 4*i, "i32"));
    }
    Module._free(ptr);
    Module._free(assignmentPtr);
    return [...bestAssignmentToDict(result, assignment, clusterCount, array.length, array), end - start]
}

const iterativeRandomizedGreedyAssignmentsC = (array, clusters) => {
    // Random list must be an Int32Array, a normal list wont work for ccall
    const randomList = Int32Array.from(array)

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
    const start = performance.now();
    const result = Module.ccall("iterative_randomized_greedy_assignements",
        'number',
        ['number', 'number', 'number'],
        [randomList.length, clusters, ptr]
    )
    const end = performance.now();

    // The previous function returns a pointer to a struct JobAssignment defined
    // in C. We didn't find a way to read this pointer from JS, so we created an
    // auxiliary C function that transforms this struct into an int array.
    // That way, we can read the values from JS. We call that function, 
    // and obtain its returned array.
    const intArray = Module.ccall("job_assignment_to_int_array", 
        'number',
        ['number', 'number', 'number'],
        [result, randomList.length, clusters])
    
    // Then, we transform the int array to an assignments object, and obtain
    // the cost of the solution.
    let maxCost = 0;
    const assignments = []
    for (let i = 0; i < clusters; i++) {
        assignments.push({cost: 0, jobs: []})
    }

    let arrayOffset = 0;
    for (let i = 0; i < clusters; i++) {
        assignments[i].cost = Module.getValue(intArray + 4*arrayOffset, 'i32');
        arrayOffset += 1;

        // Set max cost.
        if (assignments[i].cost > maxCost) {
            maxCost = assignments[i].cost
        }

        let currentLen = Module.getValue(intArray + 4*arrayOffset, 'i32');
        arrayOffset += 1;

        for (let idx = 0; idx < currentLen; idx++) {
            assignments[i].jobs.push(Module.getValue(intArray + 4*arrayOffset, 'i32'));
            arrayOffset += 1;
        }
    }
    // Before returning, we free the allocated memory.
    Module._free(ptr);
    Module._free(result);
    Module._free(intArray);
    return [assignments, maxCost, end - start]
}

Module.onRuntimeInitialized = () => {
    console.log("hello")
    const runIterativeJS = document.getElementById("runIterativeJS");
    runIterativeJS.addEventListener("click", () => 
        callSolver(instance.jobs, instance.clusters, iterativeRandomizedGreedyAssignments, "iterative-js-time"));
    const runIterativeC = document.getElementById("runIterativeC");
    runIterativeC.addEventListener("click", () => 
        callSolver(instance.jobs, instance.clusters, iterativeRandomizedGreedyAssignmentsC, "iterative-c-time"));
    const runBruteJS = document.getElementById("runBruteJS");
    runBruteJS.addEventListener("click", () => 
        callSolver(instance.jobs, instance.clusters, bruteForceAssignments, "brute-js-time"));
    const runBruteC = document.getElementById("runBruteC");
    runBruteC.addEventListener("click", () => 
        callSolver(instance.jobs, instance.clusters, bruteForceAssignmentsC, "brute-c-time"));

    
    const runAll = document.getElementById("runAll");
    runAll.addEventListener("click", () => {
        document.getElementById("iterative-js-time").innerHTML = '<i class="fa fa-refresh fa-spin" style="font-size:24px"></i>';
        document.getElementById("iterative-c-time").innerHTML = '<i class="fa fa-refresh fa-spin" style="font-size:24px"></i>';
        document.getElementById("brute-js-time").innerHTML = '<i class="fa fa-refresh fa-spin" style="font-size:24px"></i>';
        document.getElementById("brute-c-time").innerHTML = '<i class="fa fa-refresh fa-spin" style="font-size:24px"></i>';
        callSolver(instance.jobs, instance.clusters, iterativeRandomizedGreedyAssignmentsC, "iterative-c-time");
        callSolver(instance.jobs, instance.clusters, bruteForceAssignments, "brute-js-time");
        callSolver(instance.jobs, instance.clusters, iterativeRandomizedGreedyAssignments, "iterative-js-time");
        callSolver(instance.jobs, instance.clusters, bruteForceAssignmentsC, "brute-c-time");
    });

    document.getElementById("jobInput").addEventListener('change', (e) => getInput(e));

    document.getElementById("generateRandomInstanceButton").addEventListener("click", generateRandomInstance)
}

const callSolver = (jobs, clusters, solver, elementId) => {
    const elem = document.getElementById(elementId);
    elem.innerHTML= '<i class="fa fa-refresh fa-spin" style="font-size:24px;color: white"></i>';
    setTimeout(function() {
        const [bestAssignments, bestCost, time] = solver(jobs, clusters);
        const result = {
            "cost": bestCost,
            "clusters": bestAssignments
        }
        console.log(result)
        console.log(`Solver took time ${time.toFixed(3)} ms.`)
        document.getElementById(elementId).innerHTML = time.toFixed(3)+" ms.";
        // download("result.json", JSON.stringify(result, null, 2))
    }, 0);
}

const getInput = async (event) => {
    const file = event.target.files[0];
    const res = await file.text();
    const json = JSON.parse(res);
    
    instance = json
}

