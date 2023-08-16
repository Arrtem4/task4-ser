const Pool = require("pg").Pool;
const pool = new Pool({
    connectionString: `postgres://users_8lbx_user:Wcr8HWgIft2MpKCkm6KsHH9fxvxmGOXL@dpg-cjatd6pitvpc73c3tkag-a.frankfurt-postgres.render.com/users_8lbx`,
    ssl: {
        rejectUnauthorized: false,
    },
});

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
const CheckEmail = (email) => {
    return new Promise(function (resolve, reject) {
        pool.query(
            `SELECT "Email" FROM users WHERE "Email" = $1`,
            [email],
            (error, results) => {
                if (error) {
                    reject(error);
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
            'INSERT INTO users ("Email","Password","Name","RegistrationDate", "SignInDate") VALUES ($1,$2,$3,$4,$5) RETURNING "Id"',
            [email, hashPassword, name, RegistrationDate, SignInDate],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            }
        );
    });
};
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

// const deleteUser = () => {
//     return new Promise(function (resolve, reject) {
//         const id = parseInt(request.params.id);
//         pool.query(
//             "DELETE FROM users WHERE id = $1",
//             [id],
//             (error, results) => {
//                 if (error) {
//                     reject(error);
//                 }
//                 resolve(`User deleted with ID: ${id}`);
//             }
//         );
//     });
// };

module.exports = {
    getUsers,
    CheckEmail,
    registration,
    login,
    getUser,
    // deleteUser,
};
