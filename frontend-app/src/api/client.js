import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8083/api/v1/customer",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export default client;
