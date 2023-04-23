#include <stdio.h>
#include <limits.h>
#include <stdlib.h>
#include <time.h>
#include <sys/time.h>

#define iterations 500

typedef struct job_assignment {
    int length;
    int max_length;
    int* jobs;
    int cost;
} JobAssignment;

JobAssignment* init_assignments(int cluster_count, int job_count) {
    JobAssignment* assignments = malloc(sizeof(JobAssignment) * cluster_count);
    for (int i = 0; i < cluster_count; i++) {
        assignments[i].cost = 0;
        assignments[i].length = 0;
        assignments[i].max_length = job_count / cluster_count;
        assignments[i].jobs = malloc(sizeof(int) * assignments[i].max_length);
    }
    return assignments;
}

void assign_job(JobAssignment* assignment, int job, int job_idx) {
    assignment -> cost += job;
    assignment -> jobs[assignment -> length] = job_idx;
    assignment -> length += 1;
    if (assignment -> length == assignment -> max_length) {
        assignment -> jobs = realloc(assignment -> jobs, assignment -> max_length * 2 * sizeof(int));
        assignment -> max_length *= 2;
    }
}

void unnassing_job(JobAssignment* assignment, int job, int job_idx) {
    assignment -> cost -= job;
    assignment -> length -= 1;
}

int get_value(JobAssignment* assignments, int cluster_count) {
    int curr_max = 0;
    for (int i = 0; i < cluster_count; i++) {
        if (assignments[i].cost > curr_max) {
            curr_max = assignments[i].cost;
        }
    }
    return curr_max;
}

void destroy_assignments(JobAssignment* assignments, int cluster_count) {
    for (int i = 0; i < cluster_count; i++) {
        free(assignments[i].jobs);
    }
    free(assignments);
}

/* Auxiliary function to shuffle an array.
Obtained from https://stackoverflow.com/questions/6127503/shuffle-array-in-c*/
void shuffle(int *array, size_t n) {    
    if (n > 1) {
        size_t i;
        for (i = n - 1; i > 0; i--) {
            size_t j = (unsigned int) (drand48()*(i+1));
            int t = array[j];
            array[j] = array[i];
            array[i] = t;
        }
    }
}

/* Generates an approximation of the best poosible assignment 
by assigning the next random job to the least used cluster. */
void randomized_greedy_assignements(JobAssignment* assignments, int jobs_count, int clusters, int* jobs) {

    int* shuffled_jobs = malloc(sizeof(int) * jobs_count);
    for (int i = 0; i < jobs_count; i++) {
        shuffled_jobs[i] = i;
    }
    shuffle(shuffled_jobs, jobs_count);

    // For each job
    for (int i = 0; i < jobs_count; i++) {
        int current_job_idx = shuffled_jobs[i];

        // Find the least used cluster
        int least_used_cluster_idx = -1;
        int least_used_cluster_cost = INT_MAX;
        for (int cluster = 0; cluster < clusters; cluster++) {
            if (assignments[cluster].cost < least_used_cluster_cost) {
                least_used_cluster_cost = assignments[cluster].cost;
                least_used_cluster_idx = cluster;
            }
        }
        // Assign job to the least used cluster
        assign_job(&assignments[least_used_cluster_idx], jobs[current_job_idx], current_job_idx);
    }
    free(shuffled_jobs);
}

/* Auxiliary function to transform an array of assignments to an int array.
Needed to read the assignments from JS.
The array has the following format:
- First, the cost of the first cluster.
- Then, the amount of jobs assigned to that cluster.
- Then, the ID of each job assigned to that cluster.
The previous format is then repeated for each cluster.
*/
int* job_assignment_to_int_array(JobAssignment* assignments, int jobs_count, int clusters) {
    int* array = malloc(sizeof(int) * (jobs_count + 2 * clusters));
    int array_idx = 0;
    for (int i = 0; i < clusters; i++) {
        JobAssignment current_assignments = assignments[i];
        array[array_idx] = current_assignments.cost;
        array_idx += 1;
        array[array_idx] = current_assignments.length;
        array_idx += 1;
        for (int job_idx = 0; job_idx < current_assignments.length; job_idx++) {
            array[array_idx] = current_assignments.jobs[job_idx];
            array_idx += 1;
        }
    }
    return array;
}

/* Runs a number of iterations of the greedy randomized approximation, and outputs
the best one found. */
JobAssignment* iterative_randomized_greedy_assignements(int jobs_count, int clusters, int* jobs) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    int usec = tv.tv_usec;
    srand48(usec);
    
    int best_cost = INT_MAX;
    JobAssignment* best_assignments = NULL;
    
    for (int i = 0; i < iterations; i++) {
        JobAssignment* assignments = init_assignments(clusters, jobs_count);
        randomized_greedy_assignements(assignments, jobs_count, clusters, jobs);
        
        int iteration_value = get_value(assignments, clusters);
        if (iteration_value < best_cost) {
            best_cost = iteration_value;
            if (best_assignments != NULL) {
                destroy_assignments(best_assignments, clusters);
            }
            best_assignments = assignments;
        }
        else {
            destroy_assignments(assignments, clusters);
        }
    }

    // retornar lo mejor xd?
    int objective_value = 0;
    // printf("Best assignments: \n");
    for (int i = 0; i < clusters; i++) {
        // printf("Cluster %d: ", i);
        if (best_assignments[i].cost > objective_value) {
            objective_value = best_assignments[i].cost;
        }
        // for (int j = 0; j < best_assignments[i].length; j++) {
            // printf("%d ", best_assignments[i].jobs[j]);
        // }
        // printf("\nCost: %d\n", best_assignments[i].cost);
    }
    // Change if we want to return the assignments
    // destroy_assignments(best_assignments, clusters);
    return best_assignments;
    // return objective_value;
}


/* Brute-force approach, tries all combinations. */
void assignJob(int currentJob, int maxJob, int* jobs, int* clusters, int clusterCount, int* globalMax, int** clusterJobs, int* clusterIndex, int* bestAssignment){
    if(currentJob == maxJob){
        int localMax = -1;
        for(int i = 0; i < clusterCount; i++){
            if(clusters[i] > localMax){
                localMax = clusters[i];
            }
        }
        if(localMax < *globalMax && localMax > 0){
            for(int i = 0; i < clusterCount; i++){
                for(int j = 0; j < clusterIndex[i]; j++){
                    bestAssignment[clusterJobs[i][j]] = i;
                }
            }
            *globalMax = localMax;
        }
    }
    else{
        for(int i = 0; i < clusterCount; i++){
            if(clusters[i] + jobs[currentJob] > *globalMax){
                continue;
            }
            clusters[i] += jobs[currentJob];
            int idx = clusterIndex[i];
            clusterJobs[i][idx] = currentJob;
            clusterIndex[i]++;
            assignJob(currentJob + 1, maxJob, jobs, clusters, clusterCount, globalMax, clusterJobs, clusterIndex, bestAssignment);
            clusterJobs[i][idx] = -1;
            clusterIndex[i]--;
            clusters[i] -= jobs[currentJob];
        }
    }
    return;
}

int bruteForceAssignments(int jobCount, int clusterCount, int* jobs, int* bestAssignment){

    int currentJob = 0;
    int maxJob = jobCount;

    int* clusters = calloc(clusterCount, sizeof(int));

    int** clusterJobs = malloc(sizeof(int*)*clusterCount);

    for(int i = 0; i < clusterCount; i++){
        clusterJobs[i] = malloc(sizeof(int)*jobCount);
    }

    int* clusterIndex = calloc(clusterCount, sizeof(int));
    // int* bestAssignment = calloc(jobCount, sizeof(int));

    int globalMax = INT_MAX;

    assignJob(currentJob, maxJob, jobs, clusters, clusterCount, &globalMax, clusterJobs, clusterIndex, bestAssignment);

    free(clusterJobs);
    free(clusterIndex);
    // free(jobs);
    // free(bestAssignment);
    free(clusters);
    // for(int i = 0; i < jobCount; i++){
    //     printf("C: %d\n", bestAssignment[i]);
    // }
    printf("%d\n", globalMax);
    return globalMax;
}

int main() {

    srand(time(NULL));

    const int jobCount = 33000;
    const int clusterCount = 10;
    int* jobs = malloc(sizeof(int)*jobCount);

    for(int i = 0; i < jobCount; i++){
        jobs[i] = rand() % 1000;
    }

    // int* bestAssignment = calloc(jobCount, sizeof(int));
    // free(bestAssignment)
    // bruteForceAssignments(jobCount, clusterCount, jobs, bestAssignment);
    // // Iterative Randomized Approximation Method
    JobAssignment* result = iterative_randomized_greedy_assignements(jobCount, clusterCount, jobs);
    // printf("Iterative Randomized solution: %d\n", result);

    // // Brute-force method
    // int globalMax = INT_MAX;
    // int* clusterTime = calloc(clusterCount, sizeof(int));

    // int** clusterJobs = malloc(sizeof(int*)*clusterCount);

    // for(int i = 0; i < clusterCount; i++){
    //     clusterJobs[i] = malloc(sizeof(int)*jobCount);
    // }

    // int* clusterIndex = calloc(clusterCount, sizeof(int));
    // int* bestAssignment = calloc(jobCount, sizeof(int));

    // // assignJob(0, jobCount, jobs, clusterTime, clusterCount, &globalMax, clusterJobs, clusterIndex, bestAssignment);

    // for(int i = 0; i < jobCount; i++){
    //     printf("%i ", bestAssignment[i]);
    // }
    // printf("\n");
    // printf("%i\n", globalMax);

    // // Free memory
    // for(int i = 0; i < clusterCount; i++){
    //     free(clusterJobs[i]);
    // }
    // free(clusterJobs);
    // free(clusterIndex);
    // // free(jobs);
    // free(bestAssignment);
    // free(clusterTime);
    destroy_assignments(result, clusterCount);
    free(jobs);
    return 0;
}