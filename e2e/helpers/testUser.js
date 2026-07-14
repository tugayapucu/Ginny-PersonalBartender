const { randomUUID } = require("node:crypto");

const API_BASE_URL =
  process.env.E2E_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function createTestUser(prefix = "user") {
  const id = randomUUID().replaceAll("-", "");
  return {
    username: `${prefix}${id}`,
    email: `${prefix}${id}@example.com`,
    password: "Secure1!Pass",
  };
}

async function getAccessToken(page, request, user) {
  try {
    const token = await page.evaluate(() => localStorage.getItem("token"));
    if (token) return token;
  } catch {
    // The page may not have reached the app if setup failed. Fall back to API login.
  }

  const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  if (!loginResponse.ok()) return null;

  const body = await loginResponse.json();
  return body.access_token || null;
}

async function deleteTestUser({ page, request, user }) {
  if (!user) return;

  const token = await getAccessToken(page, request, user);
  if (!token) return;

  const deleteResponse = await request.delete(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!deleteResponse.ok() && deleteResponse.status() !== 401) {
    throw new Error(
      `Failed to delete E2E user ${user.email}: HTTP ${deleteResponse.status()}`
    );
  }
}

module.exports = { createTestUser, deleteTestUser };
