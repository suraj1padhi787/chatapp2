const { MongoClient, ObjectId } = require('mongodb');

// ✅ MongoDB URI
const uri = "mongodb+srv://suraj78725:babu321@cluster0.rajqhet.mongodb.net/chatdb?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true";

const client = new MongoClient(uri);

let messagesCollection;

// Connect function
async function connect() {
    try {
        await client.connect();
        const db = client.db('chatdb');
        messagesCollection = db.collection('messages');
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
}

connect();

// Insert a message
async function insertMessage(sender, receiver, content, type = 'text', replyTo = null) {
    try {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const result = await messagesCollection.insertOne({
            sender,
            receiver,
            content,
            type,
            time,
            seen: false,
            replyTo
        });
        return result.insertedId.toString();
    } catch (err) {
        console.error('❌ Insert Message Error:', err);
    }
}

// Fetch conversation
async function fetchConversation(sender, receiver, callback) {
    try {
        const messages = await messagesCollection.find({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ _id: 1 }).toArray();
        callback(messages);
    } catch (err) {
        console.error('❌ Fetch Conversation Error:', err);
        callback([]);
    }
}

// Mark as seen
async function markMessagesAsSeen(sender, receiver) {
    try {
        await messagesCollection.updateMany(
            { sender, receiver, seen: false },
            { $set: { seen: true } }
        );
    } catch (err) {
        console.error('❌ Mark Messages As Seen Error:', err);
    }
}

// Delete a message
async function deleteMessageById(messageId) {
    try {
        if (!messageId || messageId.length !== 24) {
            console.log('❌ Invalid messageId:', messageId);
            return;
        }
        await messagesCollection.deleteOne({ _id: new ObjectId(messageId) });
    } catch (err) {
        console.error('❌ Delete Message Error:', err);
    }
}

// Update (Edit) a message
async function updateMessageById(messageId, newContent) {
    try {
        if (!messageId || messageId.length !== 24) {
            console.log('❌ Invalid messageId for edit:', messageId);
            return;
        }
        await messagesCollection.updateOne(
            { _id: new ObjectId(messageId) },
            { $set: { content: newContent + " (edited)" } }
        );
    } catch (err) {
        console.error('❌ Edit Message Error:', err);
    }
}

module.exports = {
    insertMessage,
    fetchConversation,
    markMessagesAsSeen,
    deleteMessageById,
    updateMessageById
};
