import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, default: '' },
		emoji: { type: String, default: '' },
		order: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

export const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);
