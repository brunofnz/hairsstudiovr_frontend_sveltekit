import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
	{
		username: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		name: { type: String, required: true },
		role: {
			type: String,
			enum: ['admin', 'operador'],
			default: 'operador'
		},
		categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

if (mongoose.models.User) {
	delete mongoose.models.User;
}
export const UserModel = mongoose.model('User', userSchema);
