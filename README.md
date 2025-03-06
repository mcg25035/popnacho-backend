# Popnacho Backend

## Endpoints

### Authentication

*   `POST /auth/register`: Register a new user with username and password.
    *   Registers a new user account. Requires a unique username and password.
*   `POST /auth/login`: Login with username and password.
    *   Logs in an existing user with username and password.
*   `GET /auth/google`: Redirect to Google for authentication.
    *   Redirects the user to Google's authentication page for Google login.
*   `GET /auth/google/callback`: Callback URL for Google authentication.
    *   Callback URL that Google redirects to after successful or failed authentication.
*   `GET /auth/discord`: Redirect to Discord for authentication.
    *   Redirects the user to Discord's authentication page for Discord login.
*   `GET /auth/discord/callback`: Callback URL for Discord authentication.
    *   Callback URL that Discord redirects to after successful or failed authentication.

### Leaderboard

*   `GET /leaderboard`: Get the top 100 users with their pop counts.
    *   Retrieves the top 100 users ranked by their pop counts.
*   `GET /leaderboard/user/rank`: Get the current user's rank.
    *   Retrieves the current user's rank in the leaderboard. Requires authentication.
*   `GET /leaderboard/user/rank/nearby`: Get the 20 users around the current user's rank.
    *   Retrieves 20 users around the current user's rank in the leaderboard. Requires authentication.

## Configurations

The following environment variables are required:

*   `PORT`: The port the server will listen on (default: 3000).
    *   The port number that the server will listen on for incoming connections. Defaults to 3000 if not specified.
*   `MONGODB_URI`: The URI for the MongoDB database.
    *   The connection string used to connect to the MongoDB database.
*   `REDIS_HOST`: The host for the Redis server.
    *   The hostname or IP address of the Redis server.
*   `REDIS_PORT`: The port for the Redis server.
    *   The port number of the Redis server.
*   `GOOGLE_CLIENT_ID`: The client ID for Google OAuth.
    *   The client ID obtained from the Google Developer Console for Google OAuth authentication.
*   `GOOGLE_CLIENT_SECRET`: The client secret for Google OAuth.
    *   The client secret obtained from the Google Developer Console for Google OAuth authentication.
*   `DISCORD_CLIENT_ID`: The client ID for Discord OAuth.
    *   The client ID obtained from the Discord Developer Portal for Discord OAuth authentication.
*   `DISCORD_CLIENT_SECRET`: The client secret for Discord OAuth.
    *   The client secret obtained from the Discord Developer Portal for Discord OAuth authentication.
*   `SESSION_SECRET`: A secret key for signing session cookies.
    *   A randomly generated string used to sign the session ID cookie, enhancing security.

## Running the Backend

1.  Install dependencies: `npm install`
2.  Configure environment variables in `.env` file.
3.  Run the server: `node index.js`
