const express = require("express");
const path = require("path");

const app = express();

app.use("/static", express.static(path.resolve(__dirname, `static`)));

app.get("/*", (req, res) => {
	return res.sendFile(path.resolve(__dirname, "index.html"));
});

app.listen(8080, () => console.log("Server running..."));