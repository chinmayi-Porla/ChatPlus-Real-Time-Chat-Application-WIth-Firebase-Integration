const admin = require("firebase-admin");

// Try to load config keys, use defaults if not available
let configKeys;
try {
    configKeys = require("./configKeys");
} catch (error) {
    console.log("Warning: configKeys.js not found or invalid, using default values");
    configKeys = {
        firebaseDatabaseURL: "https://your-project-id.firebasedatabase.app",
        firebaseStorageBucket: "your-project-id.appspot.com"
    };
}

// Create mock Firebase services for development
const createMockFirebase = () => {
    console.log("Creating mock Firebase services for development...");
    
    const mockCollection = (path) => {
        const collectionObj = {
            doc: (id) => ({
                collection: (subPath) => mockCollection(`${path}/${id}/${subPath}`),
                onSnapshot: (callback) => {
                    console.log(`Mock onSnapshot for ${path}/${id}`);
                    return () => console.log(`Mock unsubscribe for ${path}/${id}`);
                },
                set: (data, options) => Promise.resolve(),
                update: (data) => Promise.resolve(),
                delete: () => Promise.resolve(),
                get: () => Promise.resolve({ exists: false, data: () => null }),
                where: (field, op, value) => ({
                    onSnapshot: (callback) => {
                        console.log(`Mock where onSnapshot for ${path} where ${field} ${op} ${value}`);
                        return () => console.log(`Mock where unsubscribe for ${path}`);
                    }
                }),
                orderBy: (field) => ({
                    orderBy: (field2) => ({
                        onSnapshot: (callback) => {
                            console.log(`Mock orderBy onSnapshot for ${path} orderBy ${field}, ${field2}`);
                            return () => console.log(`Mock orderBy unsubscribe for ${path}`);
                        }
                    }),
                    onSnapshot: (callback) => {
                        console.log(`Mock orderBy onSnapshot for ${path} orderBy ${field}`);
                        return () => console.log(`Mock orderBy unsubscribe for ${path}`);
                    }
                }),
                onSnapshot: (callback) => {
                    console.log(`Mock onSnapshot for ${path}/${id}`);
                    return () => console.log(`Mock unsubscribe for ${path}/${id}`);
                }
            }),
            onSnapshot: (callback) => {
                console.log(`Mock onSnapshot for ${path}`);
                return () => console.log(`Mock unsubscribe for ${path}`);
            }
        };

        // Add where method to collection
        collectionObj.where = (field, op, value) => ({
            onSnapshot: (callback) => {
                console.log(`Mock collection.where onSnapshot for ${path} where ${field} ${op} ${value}`);
                return () => console.log(`Mock collection.where unsubscribe for ${path}`);
            },
            orderBy: (field) => ({
                orderBy: (field2) => ({
                    onSnapshot: (callback) => {
                        console.log(`Mock collection.where.orderBy onSnapshot for ${path} where ${field} ${op} ${value} orderBy ${field}, ${field2}`);
                        return () => console.log(`Mock collection.where.orderBy unsubscribe for ${path}`);
                    }
                }),
                onSnapshot: (callback) => {
                    console.log(`Mock collection.where.orderBy onSnapshot for ${path} where ${field} ${op} ${value} orderBy ${field}`);
                    return () => console.log(`Mock collection.where.orderBy unsubscribe for ${path}`);
                }
            })
        });

        // Add orderBy method to collection
        collectionObj.orderBy = (field) => ({
            orderBy: (field2) => ({
                onSnapshot: (callback) => {
                    console.log(`Mock collection.orderBy onSnapshot for ${path} orderBy ${field}, ${field2}`);
                    return () => console.log(`Mock collection.orderBy unsubscribe for ${path}`);
                }
            }),
            onSnapshot: (callback) => {
                console.log(`Mock collection.orderBy onSnapshot for ${path} orderBy ${field}`);
                return () => console.log(`Mock collection.orderBy unsubscribe for ${path}`);
            }
        });

        return collectionObj;
    };

    const mockDb = {
        collection: mockCollection,
        runTransaction: (callback) => Promise.resolve(),
        doc: (path) => ({
            set: (data, options) => Promise.resolve(),
            update: (data) => Promise.resolve()
        })
    };

    const mockDb2 = {
        ref: (path) => ({
            on: (event, callback) => {
                console.log(`Mock ref on for ${path} event: ${event}`);
                return () => console.log(`Mock ref unsubscribe for ${path}`);
            }
        })
    };

    const mockMessaging = {
        send: (message) => {
            console.log("Mock messaging.send:", message);
            return Promise.resolve();
        }
    };

    const mockStorage = {
        bucket: (name) => ({
            file: (path) => ({
                save: (buffer) => Promise.resolve(),
                delete: () => Promise.resolve()
            })
        })
    };

    const mockAuth = {
        deleteUser: (uid) => {
            console.log(`Mock auth.deleteUser: ${uid}`);
            return Promise.resolve();
        }
    };

    return {
        db: mockDb,
        db2: mockDb2,
        messaging: mockMessaging,
        storage: mockStorage,
        auth: mockAuth,
        createTimestamp: () => new Date(),
        fieldIncrement: (value) => ({ _increment: value }),
        dbIncrement: (value) => ({ _increment: value })
    };
};

// Try to initialize Firebase Admin
let firebaseServices;
try {
    // Try to load service account
    let serviceAccount;
    try {
        serviceAccount = require("./serviceAccountKey.json");
        // Validate the private key format
        if (!serviceAccount.private_key || serviceAccount.private_key.includes("YOUR_PRIVATE_KEY_HERE")) {
            throw new Error("Invalid private key format");
        }
    } catch (error) {
        console.log("Warning: serviceAccountKey.json not found or invalid, using mock services");
        serviceAccount = null;
    }

    if (serviceAccount) {
        // Initialize with real credentials
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: configKeys.firebaseDatabaseURL
        });
        
        firebaseServices = {
            db: admin.firestore(),
            db2: admin.database(),
            messaging: admin.messaging(),
            storage: admin.storage().bucket(configKeys.firebaseStorageBucket),
            auth: admin.auth(),
            createTimestamp: admin.firestore.FieldValue.serverTimestamp,
            fieldIncrement: admin.firestore.FieldValue.increment,
            dbIncrement: admin.firestore.FieldValue.increment
        };
    } else {
        // Use mock services
        firebaseServices = createMockFirebase();
    }
} catch (error) {
    console.log("Warning: Firebase Admin initialization failed:", error.message);
    console.log("Using mock Firebase services for development...");
    firebaseServices = createMockFirebase();
}

module.exports = firebaseServices;