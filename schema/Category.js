import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String },
    description: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    categoryId: { type: String },
    parent_id: {
      type: Types.ObjectId,
      ref: "category",
      default: null,
    },
    level: {
      type: Number,
      default: 1,
    },
    added_by: {
      type: Types.ObjectId,
    },
    vendor_id: {
      type: Types.ObjectId,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

categorySchema.pre("save", async function (next) {
  if (this.parent_id) {
    const parentCategory = await this.constructor.findById(this.parent_id);
    if (parentCategory) {
      this.level = parentCategory.level + 1;
    }
  } else {
    this.level = 1;
  }
  next();
});

const Category = model("category", categorySchema);
export default Category;
