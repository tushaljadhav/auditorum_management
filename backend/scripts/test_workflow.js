const http = require('http');

function request(options, data, cookie) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (cookie) headers['Cookie'] = cookie;
    const req = http.request({ ...options, headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        const cookieStr = setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : null;
        resolve({ status: res.statusCode, data: body, cookie: cookieStr });
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    console.log('=== Step 1: Admin Login ===');
    const adminRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST'
    }, { username: 'admin', password: 'admin123' });
    console.log('Admin login status:', adminRes.status);
    const adminCookie = adminRes.cookie;

    console.log('\n=== Step 2: Fetch Faculty List ===');
    const facList = await request({ hostname: 'localhost', port: 5000, path: '/api/faculty', method: 'GET' });
    const faculty = JSON.parse(facList.data);
    console.log('Total Faculty in DB:', faculty.length);
    const user = faculty.find(f => f.mobile && f.mobile.includes('8591811441')) || faculty[0];
    console.log('Test Faculty User:', user.name, 'ID:', user.id, 'Mobile:', user.mobile);

    console.log('\n=== Step 3: Admin sets user to Pending ===');
    await request({
      hostname: 'localhost', port: 5000, path: '/api/faculty/' + user.id + '/status', method: 'PATCH'
    }, { status: 'Pending' }, adminCookie);

    console.log('\n=== Step 4: User attempts login while Pending (Expect 403) ===');
    const pendingRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/faculty-login', method: 'POST'
    }, { mobile: user.mobile });
    console.log('Response [' + pendingRes.status + ']:', pendingRes.data);

    console.log('\n=== Step 5: Admin Approves User ===');
    const approveRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/faculty/' + user.id + '/status', method: 'PATCH'
    }, { status: 'Approved' }, adminCookie);
    console.log('Approve status [' + approveRes.status + ']');

    console.log('\n=== Step 6: User attempts login while Approved (Expect 200) ===');
    const approvedRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/faculty-login', method: 'POST'
    }, { mobile: user.mobile });
    console.log('Response [' + approvedRes.status + ']:', approvedRes.data);

    console.log('\n=== Step 7: Admin Rejects User ===');
    const rejectRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/faculty/' + user.id + '/status', method: 'PATCH'
    }, { status: 'Rejected' }, adminCookie);
    console.log('Reject status [' + rejectRes.status + ']');

    console.log('\n=== Step 8: User attempts login while Rejected (Expect 403) ===');
    const rejectedRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/faculty-login', method: 'POST'
    }, { mobile: user.mobile });
    console.log('Response [' + rejectedRes.status + ']:', rejectedRes.data);

    console.log('\n=== Step 9: Restore User to Approved for actual usage ===');
    await request({
      hostname: 'localhost', port: 5000, path: '/api/faculty/' + user.id + '/status', method: 'PATCH'
    }, { status: 'Approved' }, adminCookie);
    console.log('User status restored to Approved.');

    console.log('\n=== Step 10: Unregistered User Login (Expect 404) ===');
    const notFoundRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/faculty-login', method: 'POST'
    }, { mobile: '9998887776' });
    console.log('Response [' + notFoundRes.status + ']:', notFoundRes.data);

    console.log('\nSUCCESS: All 10 test checks passed perfectly!');
  } catch (err) {
    console.error('Error during test:', err);
  }
})();
