// User types
export interface User {
    id: number;
    fullName: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

// Board types
export interface Board {
    id: number;
    name: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    ownerId: number;
    createdAt: string;
    updatedAt: string;
}

export interface BoardDetail extends Board {
    columns: Column[];
    members: BoardMember[];
    labels: Label[];
}

export interface BoardSummary {
    id: number;
    name: string;
    visibility: 'PRIVATE' | 'PUBLIC';
}

export interface CreateBoardRequest {
    name: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface UpdateBoardRequest {
    name?: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
}

// Column types
export interface Column {
    id: number;
    name: string;
    position: number;
    boardId: number;
    tasks?: Task[];
}

export interface CreateColumnRequest {
    name: string;
    position?: number;
}

export interface Label {
    id: number;
    name: string;
    color: string;
    boardId: number;
}

export interface CreateLabelRequest {
    name: string;
    color: string;
}

export interface UpdateLabelRequest {
    name?: string;
    color?: string;
}

export interface LabelBrief {
    id: number;
    name: string;
    color: string;
}

// Task types
export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    position: number;
    columnId: number;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaskDetail extends Task {
    assignees: AssigneeBrief[];
    labels: LabelBrief[];
    commentCount: number;
    attachmentCount: number;
}

export interface TaskSummary {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    position: number;
    columnId: number;
    dueDate?: string;
    labels: LabelBrief[];
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    position?: number;
    dueDate?: string;
    status?: TaskStatus;
    assigneeIds?: number[];
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    position?: number;
    dueDate?: string;
    status?: TaskStatus;
    assigneeIds?: number[];
}

export interface MoveTaskRequest {
    toColumnId: number;
    position?: number;
}

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

// Comment types
export interface Comment {
    id: number;
    body: string;
    taskId: number;
    authorId: number;
    author: User;
    createdAt: string;
    updatedAt: string;
}

export interface CommentCreateRequest {
    body: string;
}

export interface CommentUpdateRequest {
    body: string;
}

// Label types
export interface Label {
    id: number;
    name: string;
    color: string;
    boardId: number;
}

export interface LabelBrief {
    id: number;
    name: string;
    color: string;
}

// Member types
export interface BoardMember {
    userId: number;
    fullName: string;
    email: string;
    role: BoardRole;
}

export interface AssigneeBrief {
    id: number;
    fullName: string;
}

export type BoardRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface AddMemberRequest {
    userId: number;
    role: BoardRole;
}

export interface UpdateMemberRequest {
    role: BoardRole;
}

// API Response types
export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
    validationErrors?: Record<string, string>;
}
