const Pool = require("pg").Pool;
const pool = new Pool({
    connectionString: `postgres://users_8lbx_user:Wcr8HWgIft2MpKCkm6KsHH9fxvxmGOXL@dpg-cjatd6pitvpc73c3tkag-a/users_8lbx`,
    ssl: {
        rejectUnauthorized: false,
    },
});

const login = async ({ email, hashPassword, signInDate }) => {
    const result = await pool.query(
        `UPDATE users SET "SignInDate" = $3 WHERE "Email" = $1 AND "Password" = $2 RETURNING "Id","Blocked";`,
        [email, hashPassword, signInDate]
    );
    if (result.rows.length === 0) {
        throw new Error("There's no user with this email and password");
    } else if (result.rows[0].Blocked) {
        throw new Error("You've been blocked");
    }
    return result;
};
const registration = async ({
    email,
    name,
    hashPassword,
    RegistrationDate,
    SignInDate,
}) => {
    const result = await pool.query(
        `WITH inserted AS (
            INSERT INTO users ("Email","Password","Name","RegistrationDate", "SignInDate")
            SELECT $1,$2,$3,$4,$5
            WHERE NOT EXISTS (
                SELECT "Email" FROM users WHERE "Email" = $1
            )
         RETURNING "Id"
        )
        SELECT "Id" FROM inserted;`,
        [email, hashPassword, name, RegistrationDate, SignInDate]
    );
    if (result.rows.length === 0) {
        throw new Error("There's already a user with that email");
    }
    return result;
};
const getUsers = async () => {
    const result = await pool.query(`SELECT * FROM users ORDER BY "Id" ASC `);
    return result.rows;
};
const getUser = async (id) => {
    const result = await pool.query(`SELECT * FROM users WHERE "Id" = $1 `, [
        id,
    ]);
    return result.rows;
};
const blockUsers = async (selectedUsers) => {
    const result = await pool.query(
        `UPDATE users SET "Blocked" = 'true' WHERE "Id" = ANY ($1);`,
        [selectedUsers]
    );
    return result;
};
const unblockUsers = async (selectedUsers) => {
    const result = await pool.query(
        `UPDATE users SET "Blocked" = 'false' WHERE "Id" = ANY ($1);`,
        [selectedUsers]
    );
    return result;
};
const deleteUsers = async (selectedUsers) => {
    const result = await pool.query(
        `DELETE FROM users WHERE "Id" = ANY ($1);`,
        [selectedUsers]
    );
    return result;
};

module.exports = {
    getUsers,
    registration,
    login,
    getUser,
    blockUsers,
    unblockUsers,
    deleteUsers,
};
