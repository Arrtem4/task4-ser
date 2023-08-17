const Pool = require("pg").Pool;
const pool = new Pool({
    connectionString: `postgres://users_8lbx_user:Wcr8HWgIft2MpKCkm6KsHH9fxvxmGOXL@dpg-cjatd6pitvpc73c3tkag-a.frankfurt-postgres.render.com/users_8lbx`,
    ssl: {
        rejectUnauthorized: false,
    },
});

const login = ({ email, hashPassword, signInDate }) => {
    return new Promise(function (resolve, reject) {
        pool.query(
            `UPDATE users SET "SignInDate" = $3 WHERE "Email" = $1 AND "Password" = $2 RETURNING "Id","Blocked";`,
            [email, hashPassword, signInDate],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                if (results.rows.length === 0) {
                    reject("There's no user with this email and password");
                } else if (results.rows[0].Blocked) {
                    reject("You've been blocked");
                }
                resolve(results);
            }
        );
    });
};
const registration = ({
    email,
    name,
    hashPassword,
    RegistrationDate,
    SignInDate,
}) => {
    return new Promise(function (resolve, reject) {
        pool.query(
            `WITH inserted AS (
                INSERT INTO users ("Email","Password","Name","RegistrationDate", "SignInDate")
                SELECT $1,$2,$3,$4,$5
                WHERE NOT EXISTS (
                    SELECT "Email" FROM users WHERE "Email" = $1
                )
             RETURNING "Id"
            )
            SELECT "Id" FROM inserted;`,
            [email, hashPassword, name, RegistrationDate, SignInDate],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                if (results.rows.length === 0) {
                    reject("There's already a user with that email");
                }
                resolve(results);
            }
        );
    });
};
const getUsers = () => {
    return new Promise(function (resolve, reject) {
        pool.query(
            `SELECT * FROM users ORDER BY "Id" ASC `,
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results.rows);
            }
        );
    });
};
const getUser = (id) => {
    return new Promise(function (resolve, reject) {
        pool.query(
            `SELECT * FROM users WHERE "Id" = $1 `,
            [id],
            (error, results) => {
                if (error) {
                    return reject(error);
                }
                if (results) {
                    return resolve(results.rows);
                }
            }
        );
    });
};
const blockUsers = (selectedUsers) => {
    return new Promise(function (resolve, reject) {
        pool.query(
            `UPDATE users SET "Blocked" = 'true' WHERE "Id" = ANY ($1);`,
            [selectedUsers],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            }
        );
    });
};
const unblockUsers = (selectedUsers) => {
    return new Promise(function (resolve, reject) {
        pool.query(
            `UPDATE users SET "Blocked" = 'false' WHERE "Id" = ANY ($1);`,
            [selectedUsers],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            }
        );
    });
};
const deleteUsers = (selectedUsers) => {
    return new Promise(function (resolve, reject) {
        pool.query(
            `DELETE FROM users WHERE "Id" = ANY ($1);`,
            [selectedUsers],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            }
        );
    });
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
