/*import { connectDB } from "@/utils/connectDB";
import Example from "./model";

export const createExample = async ({ title, description }) => {
  await connectDB();
  const data = await Example.create({ title, description });

  return data;
};

export const getExample = async () => {
  await connectDB();
  const data = await Example.find({});

  return data;
};

export const findExampleByTitle = async (title) => {
  await connectDB();
  const data = await Example.find({ title: { $regex: title, $options: "i" } });

  return data;
};

export const deleteExample = async (id) => {
  await connectDB();
  await Example.findByIdAndDelete(id);
};

export const findExampleDetailById = async (id) => {
  await connectDB();
  const data = await Example.findOne({ _id: id });

  return data;
};*/
