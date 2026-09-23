export interface Exercise {
    id: number;
    slug: string;
    name_es: string;
    instructions_es: Record<string, string>;
    image: string;
    body_part: string;
    muscle: string;
    secondary_muscles: string[];
    equipment: string[];
}