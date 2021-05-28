import { Request } from 'express';

export interface AppRequest extends Request {
  payload?: {
    isManagement: boolean;
    id: number;
    firstName: string;
    lastName: string;
  };
}
