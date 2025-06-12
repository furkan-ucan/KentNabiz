const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'kentnabiz',
  synchronize: false,
});

async function findUser() {
  try {
    await dataSource.initialize();
    const result = await dataSource.query(
      'SELECT id, email, first_name, last_name, role, department_id FROM users WHERE email = $1 AND deleted_at IS NULL',
      ['member.fen1@kentnabiz.com']
    );
    console.log('User found:', result[0] || 'Not found');

    // Ayrıca team bilgilerini de alalım
    if (result[0]) {
      const teamInfo = await dataSource.query(
        'SELECT t.id, t.name FROM teams t WHERE t.team_leader_id = $1',
        [result[0].id]
      );
      console.log('Teams led by this user:', teamInfo);
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findUser();
