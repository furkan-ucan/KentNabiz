export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AssigneeType {
  USER = 'USER',
  TEAM = 'TEAM',
}

// Shared Assignment interface for frontend
export interface SharedAssignment {
  id: number;
  reportId: number;
  assigneeType: AssigneeType;
  assigneeUserId?: number;
  assigneeTeamId?: number;
  assigneeUser?: { id: number; name: string; email: string }; // UserInfo tipini kullanabilirsin
  assigneeTeam?: { id: number; name: string; departmentId: number }; // TeamInfo tipini kullanabilirsin
  assignedBy?: { id: number; name: string; email: string }; // UserInfo tipini kullanabilirsin
  status: AssignmentStatus;
  assignedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
