import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient date-based queries
saleSchema.index({ createdAt: 1 });

export default mongoose.model('Sale', saleSchema);
