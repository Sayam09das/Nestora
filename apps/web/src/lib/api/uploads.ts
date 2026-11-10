import { parseApiResponse } from '@/lib/api/parse-response';
import { fetchCsrfToken, getApiBaseUrl } from '@/lib/api/client';

export type StudentProfileUpload = {
  objectKey: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
};

export type StudentDocumentUpload = {
  objectKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
};

export async function uploadStudentProfilePhoto(
  file: File,
): Promise<{ upload?: StudentProfileUpload; error?: string }> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { error: 'API URL is not configured.' };
  }

  const formData = new FormData();
  formData.append('file', file);

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('X-Nestora-Requested-With', 'XMLHttpRequest');
  const token = await fetchCsrfToken();
  if (token) {
    headers.set('X-CSRF-Token', token);
  }

  const response = await fetch(`${baseUrl}/api/v1/uploads/student-profile`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  });
  const parsed = await parseApiResponse<{ upload: StudentProfileUpload }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { upload: parsed.data.upload };
}

export async function uploadStaffProfilePhoto(
  file: File,
): Promise<{ upload?: StudentProfileUpload; error?: string }> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { error: 'API URL is not configured.' };
  }

  const formData = new FormData();
  formData.append('file', file);

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('X-Nestora-Requested-With', 'XMLHttpRequest');
  const token = await fetchCsrfToken();
  if (token) {
    headers.set('X-CSRF-Token', token);
  }

  const response = await fetch(`${baseUrl}/api/v1/uploads/staff-profile`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  });
  const parsed = await parseApiResponse<{ upload: StudentProfileUpload }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { upload: parsed.data.upload };
}

export async function uploadStaffDocument(
  file: File,
): Promise<{ upload?: StudentDocumentUpload; error?: string }> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { error: 'API URL is not configured.' };
  }

  const formData = new FormData();
  formData.append('file', file);

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('X-Nestora-Requested-With', 'XMLHttpRequest');
  const token = await fetchCsrfToken();
  if (token) {
    headers.set('X-CSRF-Token', token);
  }

  const response = await fetch(`${baseUrl}/api/v1/uploads/staff-document`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  });
  const parsed = await parseApiResponse<{ upload: StudentDocumentUpload }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { upload: parsed.data.upload };
}

export async function downloadStaffDocument(
  objectKey: string,
  fileName: string,
): Promise<{ error?: string }> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { error: 'API URL is not configured.' };
  }

  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
  const headers = new Headers();
  headers.set('X-Nestora-Requested-With', 'XMLHttpRequest');
  const token = await fetchCsrfToken();
  if (token) {
    headers.set('X-CSRF-Token', token);
  }

  const response = await fetch(`${baseUrl}/api/v1/uploads/staff-document/${encodedKey}`, {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    let message = `Download failed (${response.status}).`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      /* binary body */
    }
    return { error: message };
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return {};
}

export async function uploadStudentDocument(
  file: File,
): Promise<{ upload?: StudentDocumentUpload; error?: string }> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { error: 'API URL is not configured.' };
  }

  const formData = new FormData();
  formData.append('file', file);

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('X-Nestora-Requested-With', 'XMLHttpRequest');
  const token = await fetchCsrfToken();
  if (token) {
    headers.set('X-CSRF-Token', token);
  }

  const response = await fetch(`${baseUrl}/api/v1/uploads/student-document`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  });
  const parsed = await parseApiResponse<{ upload: StudentDocumentUpload }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { upload: parsed.data.upload };
}
