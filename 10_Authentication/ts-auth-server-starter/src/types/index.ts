/* For custom types used in more than one module */
declare global {
  namespace Express {
    interface Request {
      userID?: string;
    }
  }
}
