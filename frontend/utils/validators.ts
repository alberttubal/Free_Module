export const required = (v: string) => (v && v.trim() !== '' ? null : 'Required');
export const email = (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email');
export const maxLen = (n: number) => (v: string) => (v && v.length <= n ? null : `Max ${n} characters`);