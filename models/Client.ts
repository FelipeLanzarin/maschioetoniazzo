import mongoose from 'mongoose'

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  document: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  notes: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Client || mongoose.model('Client', ClientSchema)
