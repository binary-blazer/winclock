import Database from 'better-sqlite3';

const db = new Database('app.db');

db.prepare(
  'CREATE TABLE IF NOT EXISTS alarms (id INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT, label TEXT)',
).run();

db.prepare(
  'CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), currentTab TEXT)',
).run();

const rowCount = (
  db.prepare('SELECT COUNT(*) as count FROM settings').get() as {
    count: number;
  }
).count;
if (rowCount === 0) {
  db.prepare("INSERT INTO settings (id, currentTab) VALUES (1, '')").run();
}

export const addAlarm = (time: string, label: string) => {
  const insert = db.prepare('INSERT INTO alarms (time, label) VALUES (?, ?)');
  insert.run(time, label);
};

export const getAlarms = () => {
  const rows = db.prepare('SELECT * FROM alarms').all();
  return rows.map((row: any) => ({
    id: row.id,
    time: row.time,
    label: row.label,
  }));
};

export const updateAlarm = (id: number, time: string, label: string) => {
  const update = db.prepare(
    'UPDATE alarms SET time = ?, label = ? WHERE id = ?',
  );
  update.run(time, label, id);
};

export const deleteAlarm = (id: number) => {
  const del = db.prepare('DELETE FROM alarms WHERE id = ?');
  del.run(id);
};

export const getCurrentTab = () => {
  const row = db.prepare('SELECT currentTab FROM settings WHERE id = 1').get();
  return (row as { currentTab: string }).currentTab;
};

export const updateCurrentTab = (currentTab: string) => {
  const update = db.prepare('UPDATE settings SET currentTab = ? WHERE id = 1');
  update.run(currentTab);
};
