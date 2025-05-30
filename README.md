DB REQUIREMENTS:
1. Database for storing users
2. Redis for caching

CONSTRAINTS;
1. CSV file might be equal or more than 50000 entries
2. CSV could conatin a-z level of embeding

FEATURE TO IMPLEMENT:
1. Take a CSV file from user and store it (1st api for uploading CSV file).
2. Process the CSV file in background without blocking user to wait.
3. While processing make entry into postgres database ion user table.
4. 2nd api for get the CSV processing info. As it's running in background.
5. 3rd to receive the stats for the user based on the age distribution.


DESIGN THOUGHT:
1. Process the CSV file using child_process: 
    As node is single threaded processing the huge task on the main thread will block the server.

2. How the manage processing for multiple CSV import from differnt users:
    a. First In First Out(FIFO): Processing the file in FIFO manner will not be efficeint, because suppose 100 CSV file is imported. And processing it one by one taking minutes to process for first and initial users while taking couple for hours for the last user. Which end up making bad user experience for some users.

    b. Consuming into chunks: Implementing the algorithms such that making user experience better for every user. In this way we try to process every csv into chunks.
    NOTE: While processing we've to update the age distribution count on redis. Inorder to generate statistics.