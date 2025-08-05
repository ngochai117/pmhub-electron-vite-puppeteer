export interface Project {
  id?: string;
  rate?: number; // 0 - 100
  uniqueId?: string; //for animation
}

export interface UserData {
  username?: string;
  password?: string;
  projects?: Project[];
}

export interface WorkLog {
  date: string; // 'YYYY-MM-DD'
  projectId: string;
  hours: number;
}
