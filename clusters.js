const {jobs, clusters} = require('./input.json')

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
    return bestAssignments, bestCost
}

iterativeRandomizedGreedyAssignments(jobs, clusters)
