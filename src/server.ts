import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { Action, SubjectInfo } from "./types";
import { PathType, ROOT_DIR, getCaptionPath, getSubjectInfo, getSubjectsDir } from "./utils";

const PORT = process.env.PORT || 3000;

console.log("console sanity check");
console.log("__dirname =", __dirname);
console.log(". =", path.resolve("."));
console.log("ROOT_DIR =", ROOT_DIR);
console.log("done sanity check")

const app = express();
app.use(express.json());
app.use(cors());

app.get("/data/subjects/*", (req, res) => {
  const filePath = (req.params as any)["0"];
  const fullPath = path.join(getSubjectsDir(PathType.Absolute), filePath);
  res.sendFile(fullPath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

function sendAsyncJson<T>(action: Action, res: express.Response, promise: Promise<T> | T): void {
  if (!(promise instanceof Promise)) {
    promise = Promise.resolve(promise);
  }
  promise
    .then((result) => res.status(200).json(result))
    .catch((err) => {
      console.error(action.action);
      console.error(err);
      return res.status(500).json({ error: err.message });
    });
}

app.post("/api", (req, res) => {
  const action: Action = req.body;

  switch (action.action) {
    case "update":
      updateSubjectInfo(action.json);
      sendAsyncJson(action, res, { message: "Subject info updated." });
      break;

    case "getSubjectInfo":
      sendAsyncJson(action, res, getSubjectInfo(action.id));
      break;

    case "getTotalSubjects":
      sendAsyncJson(action, res, getTotalSubjects());
      break;

    default:
      res.status(400).json({ message: "Invalid action." });
      break;
  }
});

export function startServer(): void {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

function updateSubjectInfo(subject: SubjectInfo): void {
  const captionPath = getCaptionPath(subject.id, PathType.Absolute);
  fs.writeFileSync(captionPath, subject.caption);
}

function getTotalSubjects(): number {
  const dir = path.join(getSubjectsDir(PathType.Absolute), "images");
  const files = fs.readdirSync(dir)
  return files.length;
}
