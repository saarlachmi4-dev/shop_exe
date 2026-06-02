# PostgreSQL Setup

Use this file once PostgreSQL is installed.

## 1. Check PostgreSQL

```powershell
psql --version
```

If this does not work, PostgreSQL is not available in the terminal yet.

## 2. Create the database

Open a PostgreSQL terminal and run:

```sql
CREATE DATABASE shop_exe;
```

## 3. Create `server/.env`

Copy `server/.env.example` into `server/.env`, then update the values:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=shop_exe
```

## 4. Start the server

```powershell
cd "C:\Users\97252\OneDrive\שולחן העבודה\overlap\shop_exe\server"
npm run start:dev
```

If the database connection is correct, TypeORM will create the tables.

