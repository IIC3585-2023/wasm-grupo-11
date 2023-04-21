import random
import json

CLUSTERS = 4
JOBS_COUNT = 40

jobs = [random.randint(1, 999) for _ in range(JOBS_COUNT)]

## txt input for c files
with open('input.txt', 'w') as tf:
    tf.write(f"{JOBS_COUNT} {CLUSTERS}\n")
    tf.write(" ".join([str(i) for i in jobs]) + "\n")


with open('input.json', 'w') as json_file:
    obj = {
        "clusters": CLUSTERS,
        "jobs": jobs
    }
    json_file.write(json.dumps(obj))
