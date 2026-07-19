const { Client } = require('pg');

async function test() {
  const passwords = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ];

  for (const pwd of passwords) {
    if (!pwd) continue;
    console.log('Testing JWT password on port 6543:', pwd.substring(0, 15) + '...');
    const client = new Client({
      host: 'db.npqecrxvllvuoxaybnoq.supabase.co',
      port: 6543,
      database: 'postgres',
      user: 'postgres',
      password: pwd,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('SUCCESS with password:', pwd.substring(0, 15) + '...');
      await client.end();
      return;
    } catch (err) {
      console.log('FAILED with password:', pwd.substring(0, 15) + '...', err.message);
    }
  }
}

test();
