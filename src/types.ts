type EnvKeys = "DATABASE_URL" | "TOKEN";

type EnvVariables = {
    [key in EnvKeys]: string;
};

declare namespace Bun {
    export interface Process{
        env: EnvVariables
    } 
}