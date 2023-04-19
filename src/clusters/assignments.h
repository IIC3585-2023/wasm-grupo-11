#pragma once

typedef struct job_assignment {
    int length;
    int max_length;
    int* jobs;
    int cost;
} JobAssignment;


/* Initialize an array of assignments */
JobAssignment* init_assignments(int cluster_count, int job_count);

/* Assign a job to a cluster */
void assign_job(JobAssignment* assignement, int job, int job_idx);

/* Unnasigns a job to a cluster */
void unnassing_job(JobAssignment* assignement, int job, int job_idx);

/* Gets the objective value of current assignments */
int get_value(JobAssignment* assignments, int cluster_count);

/* Free pointers */
void destroy_assignments(JobAssignment* assignments, int cluster_count);
