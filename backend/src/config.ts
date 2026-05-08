const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
};

const optional = (key: string, fallback: string): string =>
    process.env[key] || fallback;

export const config = {
    node_env: optional('NODE_ENV', 'development'),
    port: parseInt(optional('PORT', '3000'), 10),
    allow_origin: optional('ALLOW_ORIGIN', '*'),

    db: {
        host: required('DB_HOST'),
        port: parseInt(optional('DB_PORT', '5432'), 10),
        user: required('DB_USER'),
        password: required('DB_PASSWORD'),
        name: required('DB_NAME'),
    },

    jwt: {
        secret: required('JWT_SECRET'),
        refresh_secret: required('REFRESH_SECRET'),
        refresh_expire_days: parseInt(optional('REFRESH_EXPIRE', '30'), 10),
    },
} as const;
