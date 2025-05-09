db = db.getSiblingDB('DeviceBotDb');
db.createCollection('users');

db.createUser({
	user: 'root',
	pwd: 'root987654321',
	roles: [{ role: 'root', db: 'admin' }],
});

db.auth('root', 'root987654321');

db.users.insert([
	{
		username: 'admin',
		password: 'admin123456',
	},
]);

print('Database create succesfully');
