import crypto from "crypto";
import fs from "fs/promises";
import sharp from "sharp";

const DEFAULT_PASS_THRESHOLD = 85;
const DEFAULT_REVIEW_THRESHOLD = 70;

const normalizeThreshold = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 0), 100);
};

const getEngineName = () =>
  String(process.env.FACE_MATCH_ENGINE || "local-baseline").trim() ||
  "local-baseline";

const getThresholds = () => ({
  passThreshold: normalizeThreshold(
    process.env.FACE_MATCH_PASS_THRESHOLD,
    DEFAULT_PASS_THRESHOLD,
  ),
  reviewThreshold: normalizeThreshold(
    process.env.FACE_MATCH_REVIEW_THRESHOLD,
    DEFAULT_REVIEW_THRESHOLD,
  ),
});

const loadImageBuffer = async (source) => {
  if (!source) {
    throw new Error("Face engine requires an image source.");
  }

  if (Buffer.isBuffer(source)) {
    return source;
  }

  const value = String(source).trim();
  if (!value) {
    throw new Error("Face engine requires a non-empty image source.");
  }

  if (/^https?:\/\//i.test(value)) {
    const response = await fetch(value);
    if (!response.ok) {
      throw new Error(
        `Unable to download image for face matching: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  return fs.readFile(value);
};

const extractFeatureVector = async (source) => {
  const imageBuffer = await loadImageBuffer(source);
  const { data, info } = await sharp(imageBuffer)
    .rotate()
    .resize(64, 64, { fit: "cover", position: "centre" })
    .flatten({ background: "#ffffff" })
    .grayscale()
    .normalize()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const vector = new Float64Array(data.length);
  for (let index = 0; index < data.length; index += 1) {
    vector[index] = data[index] / 255;
  }

  return { vector, width: info.width, height: info.height };
};

const cosineSimilarity = (left, right) => {
  if (left.length !== right.length) {
    throw new Error("Face feature vectors must be the same length.");
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }

  if (!leftNorm || !rightNorm) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
};

const averageDistance = (left, right) => {
  let total = 0;

  for (let index = 0; index < left.length; index += 1) {
    total += Math.abs(left[index] - right[index]);
  }

  return total / left.length;
};

const deriveScore = (similarity, distance) => {
  const similarityScore = ((similarity + 1) / 2) * 100;
  const distanceScore = (1 - distance) * 100;
  const score = (similarityScore * 0.7) + (distanceScore * 0.3);
  return Math.max(0, Math.min(100, Number(score.toFixed(2))));
};

const buildReferenceId = (submissionId, score) =>
  crypto
    .createHash("sha1")
    .update(`${submissionId || "unknown"}:${score}:${Date.now()}`)
    .digest("hex")
    .slice(0, 20);

export const runFaceMatchEngine = async ({
  idImage,
  selfieImage,
  submissionId = "",
}) => {
  const idFeatures = await extractFeatureVector(idImage);
  const selfieFeatures = await extractFeatureVector(selfieImage);

  const similarity = cosineSimilarity(idFeatures.vector, selfieFeatures.vector);
  const distance = averageDistance(idFeatures.vector, selfieFeatures.vector);
  const score = deriveScore(similarity, distance);

  const { passThreshold, reviewThreshold } = getThresholds();
  const status =
    score >= passThreshold
      ? "passed"
      : score >= reviewThreshold
        ? "pending"
        : "failed";

  const provider = getEngineName();
  const referenceId = buildReferenceId(submissionId, score);

  return {
    provider,
    status,
    score,
    referenceId,
    evidenceUrl: "",
    notes:
      status === "passed"
        ? "Baseline face engine indicates a strong match."
        : status === "pending"
          ? "Baseline face engine indicates a borderline match. Review recommended."
          : "Baseline face engine indicates a weak match.",
    metrics: {
      similarity: Number(similarity.toFixed(6)),
      distance: Number(distance.toFixed(6)),
      passThreshold,
      reviewThreshold,
    },
    checkedAt: new Date(),
  };
};

export const faceMatchEngineConfig = () => ({
  engine: getEngineName(),
  ...getThresholds(),
});
