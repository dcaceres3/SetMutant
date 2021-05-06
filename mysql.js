const mysql = require('mysql');

class Mysql {
    constructor() {}
    static executeQuery(query, params) {
        return new Promise(resolve => {
            const paramsConnection = {
                host: 'database-mutant.cpvi5spj3zc6.us-east-1.rds.amazonaws.com',
                user: '',
                password: '',
                database: 'sys',
                port: 3306
            };
            let connection = null;
            try {
                connection = mysql.createConnection(paramsConnection);
                connection.connect();
                connection.query({
                    sql: query,
                    values: params
                }, (error, results, fields) => {
                    if (error) {
                        console.log(`Method Mysql.executeQuery error ${error}`);
                        resolve({
                            status: false,
                            error
                        });
                        return;
                    }
                    if (results.length === 0) {
                        resolve({
                            status: false
                        });
                        return;
                    } else {
                        resolve({
                            status: true,
                            results
                        });
                        return;
                    }
                });
                connection.end((err) => {
                    if (err)
                        console.log('connection.end() error:' + err.message);
                    console.log('Close the database connection.');
                });
            } catch (error) {
                console.log(`Method Mysql.executeQuery error ${error}`);
                resolve({
                    status: false,
                    error
                });
            }
        });
    }

}

module.exports = Mysql;