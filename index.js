import express from "express";
import cors from "cors";
import { userRouter } from "./src/app/User/userRoute.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", userRouter);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
