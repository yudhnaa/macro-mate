export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    newsletter: boolean;
}

export type RegisterFormErrors = {
    [K in keyof RegisterFormData]?: string;
};
