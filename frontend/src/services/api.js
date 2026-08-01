/**
 * API service for communicating with the Spring Boot backend (/api/resumes).
 */

const BASE_URL = '/api/resumes';

/**
 * Helper to parse backend RFC 7807 ProblemDetail or error responses
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const data = await response.json();
      if (data.detail) {
        errorDetail = data.detail;
      } else if (data.message) {
        errorDetail = data.message;
      } else if (data.title) {
        errorDetail = data.title;
      }
    } catch {
      errorDetail = `Server returned status ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  // 204 No Content has no body
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

/**
 * Upload a resume file
 * @param {File} file - PDF or DOCX file
 * @param {string} userId - Identity placeholder (default: anonymous)
 * @returns {Promise<Object>} ResumeResponseDto
 */
export async function uploadResume(file, userId = 'anonymous') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  const response = await fetch(BASE_URL, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
}

/**
 * Fetch resume details by ID
 * @param {string} id - Resume UUID
 * @returns {Promise<Object>} ResumeResponseDto
 */
export async function getResumeById(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  return handleResponse(response);
}

/**
 * Delete a resume by ID
 * @param {string} id - Resume UUID
 * @returns {Promise<void>}
 */
export async function deleteResume(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
}

/**
 * Fetch scan status details by scan ID (Phase 2 Async Pipeline)
 * @param {string} scanId - Scan UUID
 * @returns {Promise<Object>} ScanResponseDto
 */
export async function getScanStatus(scanId) {
  const response = await fetch(`/api/scans/${scanId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  return handleResponse(response);
}

