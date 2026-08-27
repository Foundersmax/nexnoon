import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IClassSchedule extends Document {
  classId: Types.ObjectId;
  sessionNumber: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  zoomLink?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  recordingUrl?: string;
}

export interface IClass extends Document {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  currency: string;
  instructor: {
    id: Types.ObjectId;
    name: string;
    avatar?: string;
    bio?: string;
    rating?: number;
  };
  thumbnail?: string;
  duration: number;
  totalSessions: number;
  enrolledStudents: number;
  rating: number;
  reviewsCount: number;
  isLive: boolean;
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    instructor: {
      id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      avatar: { type: String },
      bio: { type: String },
      rating: { type: Number, default: 0 },
    },
    thumbnail: { type: String },
    duration: { type: Number, required: true },
    totalSessions: { type: Number, required: true },
    enrolledStudents: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    isLive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true }
);

const ClassScheduleSchema = new Schema<IClassSchedule>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sessionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    zoomLink: { type: String },
    zoomMeetingId: { type: String },
    zoomPasscode: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export const ClassModel = mongoose.model<IClass>('Class', ClassSchema);
export const ClassScheduleModel = mongoose.model<IClassSchedule>(
  'ClassSchedule',
  ClassScheduleSchema
);


