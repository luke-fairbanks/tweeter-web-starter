#!/usr/bin/env bash
set -euo pipefail

API_ID="yunyfgvwob"
REGION="us-west-2"
DOC_VERSION="$(date +%s)"

echo "1) Ensure /follow POST has a description..."
DOC_ID=$(aws apigateway get-documentation-parts \
  --region "$REGION" \
  --rest-api-id "$API_ID" \
  --type METHOD \
  --limit 500 \
  --query "items[?location.path=='/follow' && location.method=='POST'].id | [0]" \
  --output text)

if [[ "$DOC_ID" == "None" || -z "$DOC_ID" ]]; then
  aws apigateway create-documentation-part \
    --region "$REGION" \
    --rest-api-id "$API_ID" \
    --location type=METHOD,path=/follow,method=POST \
    --properties '{"description":"Follows the target user and returns the updated follower/followee counts."}'
else
  aws apigateway delete-documentation-part \
    --region "$REGION" \
    --rest-api-id "$API_ID" \
    --documentation-part-id "$DOC_ID"

  aws apigateway create-documentation-part \
    --region "$REGION" \
    --rest-api-id "$API_ID" \
    --location type=METHOD,path=/follow,method=POST \
    --properties '{"description":"Follows the target user and returns the updated follower/followee counts."}'
fi

echo "2) Add method responses 200/400/500 to all POST endpoints..."
ENDPOINTS=(
  "/login"
  "/register"
  "/logout"
  "/user/get"
  "/follower/list"
  "/followee/list"
  "/follower/count"
  "/followee/count"
  "/follow/status"
  "/follow"
  "/unfollow"
  "/status/story/list"
  "/status/feed/list"
  "/status/post"
)

for EP in "${ENDPOINTS[@]}"; do
  RID=$(aws apigateway get-resources \
    --region "$REGION" \
    --rest-api-id "$API_ID" \
    --limit 500 \
    --query "items[?path=='$EP'].id | [0]" \
    --output text)

  if [[ "$RID" == "None" || -z "$RID" ]]; then
    echo "   - Skipping $EP (resource not found)"
    continue
  fi

  echo "   - $EP"

  for CODE in 200 400 500; do
    aws apigateway put-method-response \
      --region "$REGION" \
      --rest-api-id "$API_ID" \
      --resource-id "$RID" \
      --http-method POST \
      --status-code "$CODE" \
      --response-parameters "method.response.header.Access-Control-Allow-Origin=false" \
      >/dev/null 2>&1 || \
    aws apigateway update-method-response \
      --region "$REGION" \
      --rest-api-id "$API_ID" \
      --resource-id "$RID" \
      --http-method POST \
      --status-code "$CODE" \
      --patch-operations op=replace,path=/responseParameters/method.response.header.Access-Control-Allow-Origin,value=false \
      >/dev/null
  done

  aws apigateway put-integration-response \
    --region "$REGION" \
    --rest-api-id "$API_ID" \
    --resource-id "$RID" \
    --http-method POST \
    --status-code 200 \
    >/dev/null 2>&1 || true

  aws apigateway put-integration-response \
    --region "$REGION" \
    --rest-api-id "$API_ID" \
    --resource-id "$RID" \
    --http-method POST \
    --status-code 400 \
    --selection-pattern '.*\\[BadRequest\\].*' \
    >/dev/null 2>&1 || true

  aws apigateway put-integration-response \
    --region "$REGION" \
    --rest-api-id "$API_ID" \
    --resource-id "$RID" \
    --http-method POST \
    --status-code 500 \
    --selection-pattern '.*\\[ServerError\\].*' \
    >/dev/null 2>&1 || true
done

echo "3) Deploy API changes to Prod..."
aws apigateway create-deployment \
  --region "$REGION" \
  --rest-api-id "$API_ID" \
  --stage-name Prod \
  --description "Add 200/400/500 method responses and finalize docs"

echo "4) Publish API documentation version..."
aws apigateway create-documentation-version \
  --region "$REGION" \
  --rest-api-id "$API_ID" \
  --documentation-version "$DOC_VERSION" \
  --stage-name Prod \
  --description "Milestone 3 docs complete" || true

aws apigateway update-stage \
  --region "$REGION" \
  --rest-api-id "$API_ID" \
  --stage-name Prod \
  --patch-operations op=replace,path=/documentationVersion,value="$DOC_VERSION"

echo "5) Export swagger with extensions..."
aws apigateway get-export \
  --region "$REGION" \
  --rest-api-id "$API_ID" \
  --stage-name Prod \
  --export-type swagger \
  --parameters extensions=apigateway \
  tweeter-server-Prod-swagger-apigateway.json >/dev/null

echo "6) Quick validation..."
EMPTY_DESC_COUNT=$(grep -c '"description" : ""' tweeter-server-Prod-swagger-apigateway.json || true)
POST_EMPTY_RESPONSE_COUNT=$(grep -n '"post" : {' -A4 tweeter-server-Prod-swagger-apigateway.json | grep -c '"responses" : { }' || true)
echo "   - Empty descriptions: $EMPTY_DESC_COUNT"
echo "   - POST methods still showing empty responses object: $POST_EMPTY_RESPONSE_COUNT"

echo "Done. Exported tweeter-server-Prod-swagger-apigateway.json"