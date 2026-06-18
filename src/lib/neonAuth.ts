import { createAuthClient } from '@neondatabase/auth';

const authUrl = 'https://ep-orange-bird-aojn8x3p.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth';

export const neonAuth = createAuthClient(authUrl);
