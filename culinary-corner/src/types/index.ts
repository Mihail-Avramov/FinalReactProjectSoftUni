export interface Recipe {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    image: {
        url: string;
        publicId: string;
    };
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    category: string;
    preparationTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    servings: number;
}

export interface Comment {
    id: string;
    recipeId: string;
    userId: string;
    content: string;
    createdAt: Date;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photo?: {
        url: string;
        publicId: string;
    };
    favorites: string[];
}
