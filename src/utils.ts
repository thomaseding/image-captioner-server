import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { SubjectInfo, SubjectID } from "./types";

dotenv.config(); // It seems this only affects the current module.

export const ROOT_DIR = path.resolve(process.env.ROOT_DIR || ".");
const DATA_DIR = path.join("data");

export enum PathType {
  Absolute,
  Relative,
}

export function getSubjectsDir(type: PathType): string {
  let dir = "";
  if (type === PathType.Absolute) {
    dir = path.join(ROOT_DIR, DATA_DIR, "subjects");
  }
  else {
    dir = path.join(DATA_DIR, "subjects");
  }
  return dir;
}

export function getCaptionPath(id: SubjectID, type: PathType): string {
  let dir = "";
  if (type === PathType.Absolute) {
    dir = path.join(ROOT_DIR, DATA_DIR, "subjects", "captions");
  }
  else {
    dir = path.join(DATA_DIR, "subjects", "captions");
  }
  return path.join(dir, `${id}.txt`);
}

export function readJsonFile<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export function readTextFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

function getSubjectImagePath(id: SubjectID): string {
  const exts = [".png", ".jpg"];
  for (const ext of exts) {
    const absPath = path.join(getSubjectsDir(PathType.Absolute), "images", `${id}${ext}`);
    if (fs.existsSync(absPath)) {
      const relPath = path.join(getSubjectsDir(PathType.Relative), "images", `${id}${ext}`);
      return relPath;
    }
  }
  throw new Error(`Image not found for id ${id}`);
}

export function getSubjectInfo(id: SubjectID): SubjectInfo {
  const imagePath = getSubjectImagePath(id);
  const captionPath = getCaptionPath(id, PathType.Absolute);
  if (!fs.existsSync(captionPath)) {
    fs.writeFileSync(captionPath, "");
  }
  const caption = readTextFile(captionPath);
  const info: SubjectInfo = {
    id: id,
    imagePath: imagePath,
    caption: caption,
  };
  return info;
}
