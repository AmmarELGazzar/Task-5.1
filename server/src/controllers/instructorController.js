
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { Instructor } from '../models/Instructor.js';

// Validate the login fields
const loginSchema = Joi.object({
  username: Joi.string().trim().min(1).max(100).required(),
  password: Joi.string().min(1).max(256).required()
}).unknown(false);

// Only the name field is allowed in search
const searchSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required()
}).unknown(false);

// Return only safe instructor information
function publicProfile(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    username: doc.username,
    department: doc.department,
    role: doc.role
  };
}

// POST /api/instructors/login
export async function loginInstructor(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      convert: false
    });

    if (error) {
      return res.status(400).json({
        message: 'Invalid login input'
      });
    }

    const { username, password } = value;

    // Search by username only
    const instructor = await Instructor.findOne({
      username
    }).select('+password');

    if (!instructor) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Compare entered password with stored bcrypt hash
    const isMatch = await bcrypt.compare(
      password,
      instructor.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    return res.json({
      instructor: publicProfile(instructor)
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/instructors
export async function getDirectory(req, res, next) {
  try {
    const instructors = await Instructor.find()
      .select('name department role')
      .sort({ name: 1 })
      .lean();

    return res.json({ instructors });
  } catch (err) {
    next(err);
  }
}

// Escape regex special characters
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/instructors/search
export async function searchInstructors(req, res, next) {
  try {
    const { error, value } = searchSchema.validate(req.query, {
      convert: false
    });

    if (error) {
      return res.status(400).json({
        message: 'Invalid search parameters'
      });
    }

    // Treat search input as literal text
    const safeName = escapeRegex(value.name);

    const instructors = await Instructor.find({
      name: {
        $regex: safeName,
        $options: 'i'
      }
    })
      .select('name username department role')
      .lean();

    return res.json({
      count: instructors.length,
      instructors
    });
  } catch (err) {
    next(err);
  }
}
