import mongoose, { Schema } from 'mongoose';

const clientSchema = new Schema(
	{
		name: { type: String, required: true },
		phone: { type: String, required: true, unique: true },
		email: { type: String, default: '' },
		notes: { type: String, default: '' },
		birthDate: { type: Date, default: null }
	},
	{ timestamps: true }
);

clientSchema.index({ name: 'text' });

export const ClientModel = mongoose.models.Client || mongoose.model('Client', clientSchema);
