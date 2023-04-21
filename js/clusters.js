
/**
 * 
 * @param {int[]} arr The array to shuffle
 * Shuffles arr in-place
 */
const shuffle = (arr) => {
    if (arr.length > 1) {
        for (let i = arr.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1))
            const temp = arr[randomIndex]
            arr[randomIndex] = arr[i]
            arr[i] = temp
        }
    }
}

/**
 * 
 * @param {int[]} jobs array of job costs
 * @param {int} clusters amount of clusters
 * @returns {{cost: int, jobs: int[]}[]} an assignment of jobs to clusters
 */
const randomizedGreedyAssignments = (jobs, clusters) => {
    // Create assignments
    const assignments = []
    for (let i = 0; i < clusters; i++) {
        assignments.push({cost: 0, jobs: []})
    }

    shuffledIndexes = [...Array(jobs.length).keys()];
    shuffle(shuffledIndexes)
    
    // For each job
    for (const jobIdx of shuffledIndexes) {
        // Find the least used cluster
        let leastUsedClusterIdx = -1
        let leastUsedClusterCost = 0x7fffffff
        for (let cluster = 0; cluster < clusters; cluster++) {
            if (assignments[cluster].cost < leastUsedClusterCost) {
                leastUsedClusterCost = assignments[cluster].cost
                leastUsedClusterIdx = cluster
            }
        }
        assignments[leastUsedClusterIdx].jobs.push(jobIdx)
        assignments[leastUsedClusterIdx].cost += jobs[jobIdx]
    }
    return assignments
}

const ITERATIONS = 500
/**
 * 
 * @param {int[]} jobs 
 * @param {int} clusters 
 */
const iterativeRandomizedGreedyAssignments = (jobs, clusters) => {
    let bestCost = 0x7fffffff
    let bestAssignments = undefined

    for (i = 0; i < ITERATIONS; i++) {
        // Generate possible assignments
        assignments = randomizedGreedyAssignments(jobs, clusters)
        // Calculate cost of generated assignments
        iterationValue = 0
        for (let i = 0; i < clusters; i++) {
            if (assignments[i].cost > iterationValue) {
                iterationValue = assignments[i].cost
            }
        }
        // Check if these assignments are better than previous best
        if (iterationValue < bestCost) {
            bestCost = iterationValue
            bestAssignments = assignments
        }
    }
    console.log(`Best assignments:`)
    console.log(bestAssignments)
    console.log(`Cost: ${bestCost}`)
    return [bestAssignments, bestCost]
}


const bruteForceSolver = (currentJob, maxJob, jobs, clusters, clusterCount, 
                                globalMax, clusterJobs, clusterIndex, bestAssignment) => {
    if(currentJob == maxJob){
        let localMax = -1
        for(let i = 0; i < clusterCount; i++){
            if(clusters[i] > localMax){
                localMax = clusters[i];
            }
        }
        if(localMax < globalMax && localMax > 0){
            for(let i = 0; i < clusterCount; i++){
                for(let j = 0; j < clusterIndex[i]; j++){
                    bestAssignment[clusterJobs[i][j]] = i;
                }
            }
            globalMax = localMax
        }
    }
    else{
        for(let i = 0; i < clusterCount; i++){
            if(clusters[i] + jobs[currentJob] > globalMax) continue;
            clusters[i] += jobs[currentJob]
            let idx = clusterIndex[i]
            clusterJobs[i][idx] = currentJob;
            clusterIndex[i]++;
            let [assignment, val] = bruteForceSolver(currentJob + 1, maxJob, jobs, clusters, clusterCount,
                                  globalMax, clusterJobs, clusterIndex, bestAssignment);
            if(val < globalMax){
                globalMax = val;
                bestAssignment = assignment
            }
            clusterJobs[i][idx] = -1;
            clusterIndex[i]--;
            clusters[i] -= jobs[currentJob]
        }
    }
    return [bestAssignment, globalMax]
}

const bruteForceAssignments = (jobs, clusterCount) => {
    const jobCount = jobs.length;
    const clusters = new Array(clusterCount);

    for(let i = 0; i < clusterCount; i++){
        clusters[i] = 0;
    }

    const clusterJobs = [];

    for(let i = 0; i < clusterCount; i++){
        clusterJobs.push([]);
        for(let j = 0; j < jobCount; j++){
            clusterJobs[i].push(-1)
        }
    }

    const clusterIndex = new Array(clusterCount);

    for(let i = 0; i < clusterCount; i++){
        clusterIndex[i] = 0;
    }

    const bestAssignment = new Array(jobCount);

    let globalMax = 0x7fffffff;

    const [assignment, cost] = bruteForceSolver(0, jobCount, jobs, clusters, clusterCount, globalMax, clusterJobs, clusterIndex, bestAssignment);

    let retAssignment = [];
    for(let i = 0; i < clusterCount; i++){
        retAssignment.push([]);
    }
    costList = new Array(clusterCount);

    for(let i = 0; i < clusterCount; i++){
        costList[i] = 0;
    }
    retCost = cost

    for(let i = 0; i < jobCount; i++){
        retAssignment[assignment[i]].push(jobs[i]);
        costList[assignment[i]] += jobs[i];
    }

    retList = []

    for(let i = 0; i < clusterCount; i++){
        retList.push({
            "cost": costList[i],
            "jobs": retAssignment[i]
        })
    }

    return [retList, retCost]
}