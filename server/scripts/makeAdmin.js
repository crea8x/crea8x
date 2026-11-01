const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const identifier = process.argv[2];

if (!identifier) {
    console.log('Usage: node server/scripts/makeAdmin.js <email_or_username>');
    process.exit(1);
}

const promote = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({
            $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
        });

        if (!user) {
            console.error(`User with identifier "${identifier}" not found in database.`);
            process.exit(1);
        }

        user.role = 'admin';
        user.status = 'active';
        await user.save();

        console.log(`🎉 Success! User @${user.username} (${user.email}) is now an ADMIN.`);
        process.exit(0);
    } catch (err) {
        console.error('Error promoting user:', err.message);
        process.exit(1);
    }
};

promote();

