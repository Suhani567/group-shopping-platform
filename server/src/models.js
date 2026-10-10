import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'member' },
}, { _id: false });

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  inviteCode: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  members: { type: [MemberSchema], default: [] },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  productId: String,
  name: { type: String, required: true },
  category: String,
  price: { type: Number, default: 0, min: 0 },
  quantity: { type: Number, default: 1, min: 1 },
  emoji: String,
  color: String,
  addedBy: String,
  assignedTo: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Selected', 'Purchased'], default: 'Pending' },
}, { timestamps: true });

export const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
