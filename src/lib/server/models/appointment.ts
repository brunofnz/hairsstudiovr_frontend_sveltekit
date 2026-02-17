import mongoose, { Schema } from 'mongoose';

const appointmentServiceSchema = new Schema(
	{
		serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
		name: { type: String, required: true },
		price: { type: Number, required: true }
	},
	{ _id: false }
);

const appointmentSchema = new Schema(
	{
		clientIds: [{ type: Schema.Types.ObjectId, ref: 'Client', index: true }],
		services: { type: [appointmentServiceSchema], required: true },
		date: { type: Date, required: true, index: true },
		time: { type: String, required: true },
		totalPrice: { type: Number, required: true },
		paymentMethod: {
			type: String,
			enum: ['efectivo', 'transferencia', 'tarjeta'],
			required: true
		},
		status: {
			type: String,
			enum: ['pendiente', 'confirmado', 'completado', 'cancelado'],
			default: 'pendiente'
		},
		paid: { type: Boolean, default: false },
		notes: { type: String, default: '' }
	},
	{ timestamps: true }
);

appointmentSchema.index({ date: 1, time: 1 });

// Delete cached model to ensure schema changes are picked up during HMR
if (mongoose.models.Appointment) {
	delete mongoose.models.Appointment;
}
export const AppointmentModel = mongoose.model('Appointment', appointmentSchema);
