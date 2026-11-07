
import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    department: {
      type: String
    },

    role: {
      type: String,
      enum: ['instructor', 'superadmin'],
      default: 'instructor'
    },

    apiKey: {
      type: String,
      select: false
    },

    privateEmail: {
      type: String,
      select: false
    },

    privatePhone: {
      type: String,
      select: false
    }
  },
  { timestamps: true }
);

export const Instructor = mongoose.model('Instructor', instructorSchema);
