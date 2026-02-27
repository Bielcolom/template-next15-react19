import mongoose from "mongoose";
const { Schema } = mongoose;

const userRoleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        permissions: {
            type: [String],
            required: true,
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose?.models?.UserRole || mongoose.model("UserRole", userRoleSchema);
