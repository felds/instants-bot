import http from "http";

export default http.createServer((req, res) => {
  res.end("Olha a pedra!: " + new Date());
});
