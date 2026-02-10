#!/bin/bash
# =============================================================
# SmartSusChef Production Environment Setup Script
# Reuses UAT cluster infrastructure with separate services & ALB
# Run once to create production resources, then CI/CD handles deployments
# =============================================================
set -euo pipefail

REGION="ap-southeast-1"
CLUSTER="smartsuschef-uat-cluster"
PREFIX="smartsuschef-prod"

echo "=============================================="
echo "  SmartSusChef Production Environment Setup"
echo "  Cluster: $CLUSTER (shared with UAT)"
echo "=============================================="

# ----------------------------
# 1. Get VPC / Subnet / SG info from UAT
# ----------------------------
echo ""
echo "[1/7] Discovering UAT infrastructure..."

VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=smartsuschef-uat-vpc" \
  --query 'Vpcs[0].VpcId' --output text --region $REGION)
echo "  VPC: $VPC_ID"

PUBLIC_SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*public*" \
  --query 'Subnets[*].SubnetId' --output text --region $REGION)
echo "  Public Subnets: $PUBLIC_SUBNETS"

PRIVATE_SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*private*" \
  --query 'Subnets[*].SubnetId' --output text --region $REGION)
echo "  Private Subnets: $PRIVATE_SUBNETS"

ALB_SG=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=smartsuschef-uat-alb-sg" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' --output text --region $REGION)
echo "  ALB SG: $ALB_SG"

ECS_SG=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=smartsuschef-uat-ecs-sg" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' --output text --region $REGION)
echo "  ECS SG: $ECS_SG"

# ----------------------------
# 2. Create CloudWatch Log Groups
# ----------------------------
echo ""
echo "[2/7] Creating CloudWatch Log Groups..."

for svc in backend frontend ml; do
  LOG_GROUP="/ecs/smartsuschef-production-${svc}"
  if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --query 'logGroups[0].logGroupName' --output text --region $REGION 2>/dev/null | grep -q "$LOG_GROUP"; then
    echo "  $LOG_GROUP already exists"
  else
    aws logs create-log-group --log-group-name "$LOG_GROUP" --region $REGION
    aws logs put-retention-policy --log-group-name "$LOG_GROUP" --retention-in-days 30 --region $REGION
    echo "  Created $LOG_GROUP (30-day retention)"
  fi
done

# ----------------------------
# 3. Create Production ALB
# ----------------------------
echo ""
echo "[3/7] Creating Production ALB..."

# Convert subnet list to array
SUBNET_ARRAY=($PUBLIC_SUBNETS)

PROD_ALB_ARN=$(aws elbv2 describe-load-balancers --names "$PREFIX-alb" \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text --region $REGION 2>/dev/null || echo "None")

if [ "$PROD_ALB_ARN" = "None" ] || [ -z "$PROD_ALB_ARN" ]; then
  PROD_ALB_ARN=$(aws elbv2 create-load-balancer \
    --name "$PREFIX-alb" \
    --subnets ${SUBNET_ARRAY[@]} \
    --security-groups $ALB_SG \
    --scheme internet-facing \
    --type application \
    --tags Key=Project,Value=SmartSusChef Key=Environment,Value=production \
    --query 'LoadBalancers[0].LoadBalancerArn' --output text --region $REGION)
  echo "  Created ALB: $PROD_ALB_ARN"
else
  echo "  ALB already exists: $PROD_ALB_ARN"
fi

PROD_ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns "$PROD_ALB_ARN" \
  --query 'LoadBalancers[0].DNSName' --output text --region $REGION)
echo "  Production ALB DNS: $PROD_ALB_DNS"

# ----------------------------
# 4. Create Target Groups
# ----------------------------
echo ""
echo "[4/7] Creating Target Groups..."

create_tg() {
  local name=$1 port=$2 health_path=$3
  TG_ARN=$(aws elbv2 describe-target-groups --names "$name" \
    --query 'TargetGroups[0].TargetGroupArn' --output text --region $REGION 2>/dev/null || echo "None")

  if [ "$TG_ARN" = "None" ] || [ -z "$TG_ARN" ]; then
    TG_ARN=$(aws elbv2 create-target-group \
      --name "$name" \
      --protocol HTTP \
      --port $port \
      --vpc-id $VPC_ID \
      --target-type ip \
      --health-check-protocol HTTP \
      --health-check-path "$health_path" \
      --health-check-interval-seconds 30 \
      --healthy-threshold-count 2 \
      --unhealthy-threshold-count 3 \
      --tags Key=Project,Value=SmartSusChef Key=Environment,Value=production \
      --query 'TargetGroups[0].TargetGroupArn' --output text --region $REGION)
    echo "  Created: $name → $TG_ARN"
  else
    echo "  Exists: $name → $TG_ARN"
  fi
  echo "$TG_ARN"
}

BE_TG_ARN=$(create_tg "ssc-prod-be-tg" 8080 "/health")
FE_TG_ARN=$(create_tg "ssc-prod-fe-tg" 80 "/")

# ----------------------------
# 5. Create ALB Listeners
# ----------------------------
echo ""
echo "[5/7] Configuring ALB Listeners..."

# Check if HTTP listener exists
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "$PROD_ALB_ARN" \
  --query 'Listeners[?Port==`80`].ListenerArn' --output text --region $REGION 2>/dev/null || echo "")

if [ -z "$LISTENER_ARN" ] || [ "$LISTENER_ARN" = "None" ]; then
  LISTENER_ARN=$(aws elbv2 create-listener \
    --load-balancer-arn "$PROD_ALB_ARN" \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$FE_TG_ARN \
    --query 'Listeners[0].ListenerArn' --output text --region $REGION)
  echo "  Created HTTP:80 listener → frontend TG"
else
  echo "  HTTP:80 listener already exists"
fi

# Add /api/* rule for backend
EXISTING_RULES=$(aws elbv2 describe-rules --listener-arn "$LISTENER_ARN" \
  --query 'Rules[?Conditions[?Field==`path-pattern` && Values[0]==`/api/*`]].RuleArn' \
  --output text --region $REGION 2>/dev/null || echo "")

if [ -z "$EXISTING_RULES" ] || [ "$EXISTING_RULES" = "None" ]; then
  aws elbv2 create-rule \
    --listener-arn "$LISTENER_ARN" \
    --priority 100 \
    --conditions Field=path-pattern,Values='/api/*' \
    --actions Type=forward,TargetGroupArn=$BE_TG_ARN \
    --region $REGION > /dev/null
  echo "  Created rule: /api/* → backend TG"
else
  echo "  /api/* rule already exists"
fi

# ----------------------------
# 6. Create ECS Services
# ----------------------------
echo ""
echo "[6/7] Creating Production ECS Services..."

PRIVATE_SUBNET_ARRAY=($PRIVATE_SUBNETS)
SUBNET_CSV=$(IFS=,; echo "${PRIVATE_SUBNET_ARRAY[*]}")

create_ecs_service() {
  local name=$1 task_family=$2 container_port=$3 tg_arn=$4

  SERVICE_STATUS=$(aws ecs describe-services --cluster $CLUSTER --services "$name" \
    --query 'services[0].status' --output text --region $REGION 2>/dev/null || echo "MISSING")

  if [ "$SERVICE_STATUS" = "ACTIVE" ]; then
    echo "  Service $name already exists (ACTIVE)"
    return
  fi

  # Register a placeholder task definition first
  LATEST_TASK=$(aws ecs list-task-definitions --family-prefix "$task_family" --sort DESC \
    --query 'taskDefinitionArns[0]' --output text --region $REGION 2>/dev/null || echo "None")

  if [ "$LATEST_TASK" = "None" ] || [ -z "$LATEST_TASK" ]; then
    echo "  WARNING: No task definition found for $task_family. Service will be created on first CI/CD deployment."
    return
  fi

  if [ -n "$tg_arn" ] && [ "$tg_arn" != "" ]; then
    aws ecs create-service \
      --cluster $CLUSTER \
      --service-name "$name" \
      --task-definition "$LATEST_TASK" \
      --desired-count 1 \
      --launch-type FARGATE \
      --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_CSV],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
      --load-balancers "targetGroupArn=$tg_arn,containerName=$(echo $task_family | sed 's/production-/smartsuschef-/'),containerPort=$container_port" \
      --deployment-configuration "deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=100" \
      --region $REGION > /dev/null
  else
    aws ecs create-service \
      --cluster $CLUSTER \
      --service-name "$name" \
      --task-definition "$LATEST_TASK" \
      --desired-count 1 \
      --launch-type FARGATE \
      --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_CSV],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
      --deployment-configuration "deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=100" \
      --region $REGION > /dev/null
  fi
  echo "  Created service: $name"
}

create_ecs_service "smartsuschef-prod-backend-service" "production-backend" 8080 "$BE_TG_ARN"
create_ecs_service "smartsuschef-prod-frontend-service" "production-frontend" 80 "$FE_TG_ARN"
create_ecs_service "smartsuschef-prod-ml-service" "production-ml" 8000 ""

# ----------------------------
# 7. Summary
# ----------------------------
echo ""
echo "=============================================="
echo "[7/7] Production Environment Setup Complete!"
echo "=============================================="
echo ""
echo "  Cluster:      $CLUSTER (shared with UAT)"
echo "  Production ALB: http://$PROD_ALB_DNS"
echo "  Backend:      smartsuschef-prod-backend-service"
echo "  Frontend:     smartsuschef-prod-frontend-service"
echo "  ML:           smartsuschef-prod-ml-service"
echo ""
echo "  Backend TG:   $BE_TG_ARN"
echo "  Frontend TG:  $FE_TG_ARN"
echo ""
echo "Next steps:"
echo "  1. Update PROD_ALB_URL in GitHub Secrets or workflow"
echo "  2. Push to main branch to trigger CI/CD production deployment"
echo "  3. Access production at: http://$PROD_ALB_DNS"
echo ""
