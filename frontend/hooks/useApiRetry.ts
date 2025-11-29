export async function withRetry(fn: () => Promise<any>, maxRetries = 4) {
let attempt = 0;
while (true) {
try {
return await fn();
} catch (err: any) {
attempt++;
const status = err?.status || err?.response?.status;
if (status !== 429 || attempt > maxRetries) throw err;
const wait = Math.pow(2, attempt) * 300 + Math.random() * 100;
await new Promise((r) => setTimeout(r, wait));
}
}
}