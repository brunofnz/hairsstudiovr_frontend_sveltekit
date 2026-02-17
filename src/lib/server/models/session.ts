import mongoose, { Schema } from 'mongoose';

const sessionSchema = new Schema(
	{
		sessionId: { type: String, required: true, unique: true, index: true },
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
	},
	{ timestamps: true }
);

if (mongoose.models.Session) {
	delete mongoose.models.Session;
}
export const SessionModel = mongoose.model('Session', sessionSchema);
