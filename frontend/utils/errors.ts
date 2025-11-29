export const parseBackendError = (data: any) => {
if (!data) return null;
if (data.error) return { code: data.error.code, message: data.error.message, details: data.error.details };
// Fallback to common shapes
if (data.message) return { message: data.message };
return null;
};