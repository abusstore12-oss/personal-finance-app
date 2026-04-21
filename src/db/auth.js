// src/db/auth.js

class AuthSystem {
    constructor() {
        this.dbName = 'userAuthDB';
        this.storeName = 'users';
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains(this.storeName)) {
                    this.db.createObjectStore(this.storeName, { keyPath: 'username' });
                }
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            request.onerror = (event) => {
                reject('Error initializing database: ' + event.target.errorCode);
            };
        });
    }

    async registerUser(username, password) {
        const hashedPassword = await this.hashPassword(password);
        const user = { username, password: hashedPassword };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(user);

            request.onsuccess = () => resolve('User registered successfully');
            request.onerror = () => reject('Error registering user');
        });
    }

    async loginUser(username, password) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(username);

            request.onsuccess = (event) => {
                const user = event.target.result;
                if (user && this.verifyPassword(password, user.password)) {
                    resolve('Login successful');
                } else {
                    reject('Invalid username or password');
                }
            };
            request.onerror = () => reject('Error logging in');
        });
    }

    getCurrentUser(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(username);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            request.onerror = () => reject('Error fetching current user');
        });
    }

    logoutUser(username) {
        // Implement logout logic as needed, e.g., removing user session
        console.log(username + ' logged out');
    }

    async hashPassword(password) {
        // Implement a password hashing function here
        return password; // Placeholder; use a library like bcrypt
    }

    verifyPassword(inputPassword, storedPassword) {
        // Implement password verification logic here
        return inputPassword === storedPassword; // Placeholder
    }
}

export default new AuthSystem();