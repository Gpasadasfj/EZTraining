export interface NextWorkout {
    routine_day: number;
    routine_name: string;
    name: string;
}

export interface PersonalRecord {
    body_part: string;
    exercise: string;
    weight: number;
    reps: number;
}

export interface PersonalRecords {
    chest: PersonalRecord | Record<string, never>;
    back: PersonalRecord | Record<string, never>;
    legs: PersonalRecord | Record<string, never>;
}

export interface DashboardData {
    workouts_this_week: number;
    target_workouts: number | null;
    volume_this_week: number;
    current_weight: number | null;
    target_weight: number | null;
    next_workout: NextWorkout | null;
    personal_records: PersonalRecords;
}