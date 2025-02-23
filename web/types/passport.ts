export interface PassportItem {
  id: string;
  sender: string;
  timestamp?: number;
}

export interface SuiPassport {
  id: string;
  name:string;
  avatar:string;
  introduction:string;
  exhibit:string[];
  collections:string[];
  points:number;
  x:string;
  github:string;
  email:string;
  last_time:number;
}