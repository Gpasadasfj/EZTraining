export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
    height: string;
    current_weight: string;
    target_weight: string;
}

export type UpdateUserPayload = Partial<
    Pick<User, "first_name" | "last_name" | "avatar" | "height" | "current_weight" | "target_weight">
>;

export interface WeightLog {
    id: number;
    weight: string;
    recorded_at: string;
}

export interface CreateWeightLogPayload {
    weight: string;
}

export type WeightLogItemProps = {
    log: WeightLog;
    isDeleting: boolean;
    onDelete: (id: number) => void;
};