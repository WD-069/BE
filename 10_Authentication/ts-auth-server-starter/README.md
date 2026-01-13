# WBS Travel Journal API

Starter code for authentication/authorization module at WBS Coding School

## Setup

- Fork repo
- Clone into your computer
- `cd` into working directory
- `npm i` to install dependencies
- create a `.env` file with variables:
  - `MONGO_URI` set to a valid MongoDB connection string.
  - `PORT` ONLY in case you want to override the default `8000`

## Commands

- `npm run dev`: Starts development server, pulling environment variables from `.env` file
- `npm start`: Starts production server, pulling environment variables from the system

## Project Structure

You are expected to create and organize your code into the following directories. This separation of concerns is a key principle of building maintainable applications.

- `src/controllers`: Contains the request handlers (controller functions) that implement the logic for each API endpoint.
- `src/models`: Defines the Mongoose schemas for your database collections (`User`, `RefreshToken`).
- `src/middlewares`: Holds custom middleware functions, such as for error handling, 404 errors, and request validation.
- `src/routes`: Defines the API routes and maps them to the corresponding controller functions.
- `src/schemas`: Contains Zod schemas for validating the request bodies of incoming requests.
- `src/utils`: Includes utility functions, such as those for creating and managing JSON Web Tokens (JWTs).
- `src/config`: For managing configuration, especially environment variables.

## API Endpoints

You must implement the following API endpoints under the `/auth` route:

| Method   | Endpoint    | Description                                                                                         |
| :------- | :---------- | :-------------------------------------------------------------------------------------------------- |
| `POST`   | `/register` | Creates a new user. Hashes the password before saving. Returns an access token and a refresh token. |
| `POST`   | `/login`    | Authenticates a user. If credentials are correct, returns a new access and refresh token.           |
| `DELETE` | `/logout`   | Invalidates both the access and refresh tokens.                                                     |

## Middleware

- **Error Handling**: Create a centralized error handling middleware to catch and format all errors that occur in your application.
- **Not Found**: Implement a middleware to handle requests to routes that do not exist, returning a 404 error.
- **Request Validation**: Create a middleware that uses your Zod schemas to validate request bodies.

## Environment Variables

Your application should be configurable via environment variables. Create a `.env.development.local` file for local development with the following variables:

- `ACCESS_JWT_SECRET`: A secret key for signing access tokens.
- `DB_NAME`: The db name in your mongo cluster that you share with your data API.
- `CLIENT_BASE_URL`: The URL of your Frontend, needed for CORS.
- `MONGO_URI`: The connection string for your MongoDB database.
- `SALT_ROUNDS`: The number of salt rounds for bcrypt.
