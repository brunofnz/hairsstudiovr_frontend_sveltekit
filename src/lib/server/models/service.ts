import mongoose, { Schema } from 'mongoose';

const serviceSchema = new Schema(
	{
		categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
		name: { type: String, required: true },
		price: { type: Number, required: true },
		description: { type: String, default: '' },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

export const ServiceModel = mongoose.models.Service || mongoose.model('Service', serviceSchema);
