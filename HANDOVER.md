# Popnacho Backend Handover Document

## Project Overview

This project is the backend for a "popnacho" web application, similar to "popcat." It handles user authentication, manages pop counts, and provides leaderboard functionality.

## Technology Stack

*   Express.js
*   MongoDB
*   Redis
*   Passport.js
*   bcrypt
*   socket.io
*   dotenv

## Directory Structure

*   `config`: Contains configuration files (e.g., database connection, passport setup).
*   `controllers`: Contains route handlers.
*   `models`: Contains Mongoose schemas.
*   `routes`: Contains API routes.
*   `utils`: Contains utility functions.

## Key Files

*   `index.js`: The main entry point of the application. Sets up the Express app, connects to the database, and defines the routes.
*   `models/user.js`: Defines the Mongoose schema for users.
*   `models/popCount.js`: Defines the Mongoose schema for pop counts.
*   `config/passport.js`: Configures Passport.js for local, Google, and Discord authentication.
*   `routes/auth.js`: Defines the authentication routes (register, login, Google, Discord).
*   `routes/leaderboard.js`: Defines the leaderboard routes (get top users, get user rank, get nearby users).
*   `controllers/userController.js`: Handles user registration logic.
*   `controllers/leaderboardController.js`: Handles leaderboard logic.
*   `.env`: Stores environment variables.

## API Endpoints

### Authentication

*   `POST /auth/register`: Register a new user with username and password.
    *   Request Body:
        ```json
        {
          "username": "string",
          "password": "string"
        }
        ```
    *   Expected Response (Success):
        ```json
        {
          "message": "User registered successfully"
        }
        ```
    *   Expected Response (Failure - Username Exists):
        ```json
        {
          "message": "Username already exists"
        }
        ```
*   `POST /auth/login`: Login with username and password.
    *   Request Body:
        ```json
        {
          "username": "string",
          "password": "string"
        }
        ```
    *   Expected Response (Success): Redirect to success page (e.g., `/`).
    *   Expected Response (Failure): Redirect to login page with error message.
*   `GET /auth/google`: Redirect to Google for authentication.
    *   Expected Response: Redirect to Google's authentication page.
*   `GET /auth/google/callback`: Callback URL for Google authentication.
    *   Expected Response (Success): Redirect to success page (e.g., `/`).
    *   Expected Response (Failure): Redirect to login page with error message.
*   `GET /auth/discord`: Redirect to Discord for authentication.
    *   Expected Response: Redirect to Discord's authentication page.
*   `GET /auth/discord/callback`: Callback URL for Discord authentication.
    *   Expected Response (Success): Redirect to success page (e.g., `/`).
    *   Expected Response (Failure): Redirect to login page with error message.

### Leaderboard

*   `GET /leaderboard`: Get the top 100 users with their pop counts.
    *   Expected Response:
        ```json
        [
          {
            "user": {
              "_id": "string",
              "username": "string",
              "avatar": "string"
            },
            "count": "number"
          }
        ]
        ```
*   `GET /leaderboard/user/rank`: Get the current user's rank.
    *   Requires authentication.
    *   Expected Response (Success):
        ```json
        {
          "rank": "number"
        }
        ```
    *   Expected Response (Failure - Unauthorized):
        ```json
        {
          "message": "Unauthorized"
        }
        ```
    *   Expected Response (Failure - User Pop Count Not Found):
         ```json
        {
          "message": "User pop count not found"
        }
        ```
*   `GET /leaderboard/user/rank/nearby`: Get the 20 users around the current user's rank.
    *   Requires authentication.
     *   Expected Response (Success):
        ```json
        [
          {
            "user": {
              "_id": "string",
              "username": "string",
              "avatar": "string"
            },
            "count": "number"
          }
        ]
        ```
    *   Expected Response (Failure - Unauthorized):
        ```json
        {
          "message": "Unauthorized"
        }
        ```
    *   Expected Response (Failure - User Pop Count Not Found):
         ```json
        {
          "message": "User pop count not found"
        }
        ```

## Testing Instructions

### Account/Password Authentication

1.  **Register a new user:**
    *   Send a `POST` request to `/auth/register` with the following JSON body:
        ```json
        {
          "username": "testuser",
          "password": "testpassword"
        }
        ```
    *   Verify that the response is a 201 status code and the JSON body is:
        ```json
        {
          "message": "User registered successfully"
        }
        ```
2.  **Login with the new user:**
    *   Send a `POST` request to `/auth/login` with the following JSON body:
        ```json
        {
          "username": "testuser",
          "password": "testpassword"
        }
        ```
    *   Verify that the response is a 302 redirect to the success page (e.g., `/`). You may need to use a tool like `curl` with the `-L` option to follow redirects.

### Google Authentication (Disabled for now)

1.  **Redirect to Google:**
    *   Send a `GET` request to `/auth/google`.
    *   Verify that the response is a 302 redirect to Google's authentication page.
2.  **Google Callback:**
    *   This endpoint is automatically called by Google after authentication.
    *   When Google Auth is disabled, this will likely result in an error or redirect to the failure URL.

### Discord Authentication (Disabled for now)

1.  **Redirect to Discord:**
    *   Send a `GET` request to `/auth/discord`.
    *   Verify that the response is a 302 redirect to Discord's authentication page.
2.  **Discord Callback:**
    *   This endpoint is automatically called by Discord after authentication.
    *   When Discord Auth is disabled, this will likely result in an error or redirect to the failure URL.

### Leaderboard Endpoints

1.  **Get the top 100 users:**
    *   Send a `GET` request to `/leaderboard`.
    *   Verify that the response is a 200 status code and the JSON body is an array of user objects with `user` and `count` properties.
2.  **Get the current user's rank:**
    *   First, you need to be authenticated. After a successful login, the server will set a session cookie. You need to include this cookie in your request.
    *   Send a `GET` request to `/leaderboard/user/rank`.
    *   Verify that the response is a 200 status code and the JSON body is:
        ```json
        {
          "rank": "number"
        }
        ```
3.  **Get the 20 users around the current user's rank:**
    *   First, you need to be authenticated. After a successful login, the server will set a session cookie. You need to include this cookie in your request.
    *   Send a `GET` request to `/leaderboard/user/rank/nearby`.
    *   Verify that the response is a 200 status code and the JSON body is an array of user objects with `user` and `count` properties.

## Excluding Google/Discord Authentication

To temporarily disable Google and Discord authentication for testing purposes, you can comment out the corresponding sections in `config/passport.js`:

```javascript
// passport.use(new GoogleStrategy({ ... }));

// passport.use(new DiscordStrategy({ ... }));
```

Also, remove or comment out the Google and Discord routes in `routes/auth.js`:

```javascript
// router.get('/google', passport.authenticate('google', { scope: ['profile'] }));
// router.get('/google/callback', ...);

// router.get('/discord', passport.authenticate('discord'));
// router.get('/discord/callback', ...);
```

## Stress Testing Instructions

To perform stress tests and determine the system's request per second (req/s) capacity, you can use a tool like `ab` (Apache Benchmark) or `wrk`.

Here's an example using `ab` to stress test the `/leaderboard` endpoint:

```bash
ab -n 1000 -c 100 http://localhost:3000/leaderboard
```

*   `-n 1000`:  Sends a total of 1000 requests.
*   `-c 100`: Sends 100 concurrent requests at a time.
*   `http://localhost:3000/leaderboard`: The URL to test.

After running the test, look for the "Requests per second" value in the output. This will give you an estimate of the system's req/s capacity.

You should perform stress tests on all API endpoints to identify potential bottlenecks.

## Running the Application

1.  Install dependencies: `npm install`
2.  Configure environment variables in the `.env` file.
3.  Run the server: `node index.js`
