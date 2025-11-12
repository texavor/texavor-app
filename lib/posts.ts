import { baseURL } from "./axiosInstace";
import axios from "axios";

export async function getAllPosts() {
  try {
    const res = await axios.get(`${baseURL}/easywrite_articles`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}
