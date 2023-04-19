#include <stdlib.h>
#include "assignments.h"

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