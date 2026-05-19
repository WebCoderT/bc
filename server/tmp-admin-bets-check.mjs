const baseUrl = process.env.CHECK_API_BASE_URL ?? 'http://localhost:8000/api';

const loginResponse = await fetch(`${baseUrl}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin_root',
    password: 'Admin@123',
  }),
});

const loginText = await loginResponse.text();
const loginData = loginText ? JSON.parse(loginText) : null;

if (!loginResponse.ok) {
  console.error(
    JSON.stringify(
      { step: 'login', status: loginResponse.status, body: loginData },
      null,
      2,
    ),
  );
  process.exit(1);
}

const token = loginData?.data?.accessToken;

const betsResponse = await fetch(`${baseUrl}/admin/bets?page=1&pageSize=10`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const betsText = await betsResponse.text();
const betsData = betsText ? JSON.parse(betsText) : null;
console.log(
  JSON.stringify(
    { step: 'bets', status: betsResponse.status, body: betsData },
    null,
    2,
  ),
);

if (!betsResponse.ok) {
  process.exit(1);
}
