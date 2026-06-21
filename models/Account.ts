import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema({
  paymentDate: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
}, { timestamps: true })

const CycleConfigSchema = new mongoose.Schema({
  dueDay: { type: Number },
  startMonth: { type: String },
  endMonth: { type: String },
}, { _id: false })

const AccountSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'paid', 'cancelled'], default: 'open' },
  cycle: { type: String, enum: ['one-time', 'monthly'], required: true },
  cycleConfig: { type: CycleConfigSchema },
  payments: [PaymentSchema],
  totalPaid: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.Account || mongoose.model('Account', AccountSchema)
