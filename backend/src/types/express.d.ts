declare namespace Express {
  export interface Request {
    session?: {
      id: string;
      [key: string]: any;
    };
    user?: any;
    userId?: string;
  }
}
