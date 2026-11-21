#!/bin/sh
# Create a bucket whose objects anyone can read but nobody can list, with MinIO's client (mc).
# Used by compose.yaml locally and run once by hand on each Dokploy MinIO (README, Deployments).
# Needs S3_ENDPOINT, S3_ROOT_USER, S3_ROOT_PASSWORD and S3_BUCKET.
set -eu

mc alias set artnote "$S3_ENDPOINT" "$S3_ROOT_USER" "$S3_ROOT_PASSWORD" >/dev/null
mc mb --ignore-existing "artnote/$S3_BUCKET"

policy=$(mktemp)
cat > "$policy" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::$S3_BUCKET/*"]
    }
  ]
}
JSON
mc anonymous set-json "$policy" "artnote/$S3_BUCKET"
echo "Bucket $S3_BUCKET ready: public reads, no listing"
