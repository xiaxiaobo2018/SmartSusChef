# FastAPI + AWS Deployment Guide (ML)

This document corresponds to deployment files under the `ML` directory:

- `app/main.py` FastAPI entry point
- `app/inference.py` Model loading and inference
- `Dockerfile` Container build
- `aws/task-definition.json` ECS task definition template
- `.github/workflows/deploy-ecs.yml` GitHub Actions CI/CD

## 1. Prerequisites

1. You already have available model files:
   - `models/champion_registry.pkl`
   - `models/prophet_<dish>.pkl`
   - `models/<champion>_<dish>.pkl`
2. AWS resources have been created:
   - ECR repository
   - ECS Fargate cluster and service
   - Task execution role (with ECR pull and CloudWatch Logs permissions)

## 2. Local Startup Verification

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Verify endpoints:

- `GET /health`
- `GET /dishes`
- `POST /predict`
- `POST /store/{store_id}/predict` (inference only, does not trigger training)

## 3. /predict Request Example

```json
{
  "dish": "Kung Pao Chicken",
  "recent_sales": [30, 28, 35, 40, 38, 42, 36, 39, 41, 37],
  "horizon_days": 14,
  "address": "Shanghai, China"
}
```

Optional fields: `start_date`, `latitude`, `longitude`, `country_code`, `weather_rows`.

## 4. AWS File Placeholders to Replace

### 4.1 `aws/task-definition.json`

Replace:

- `<ACCOUNT_ID>`
- `<REGION>`
- ECR repository name
- Log group name (can use default)

### 4.2 GitHub Secrets (Actions)

Configure in repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`

## 5. CI/CD Trigger Method

- Push to `main` triggers automatically
- Or manually trigger `workflow_dispatch`

Workflow:

1. Build Docker image
2. Push to ECR
3. Render ECS task definition (inject image tag)
4. Update ECS service and wait for stability

## 6. Runtime Configuration

Reads environment variables by default:

- `MODEL_DIR` (defaults to `models`)

If models are in another path, set `MODEL_DIR` for the container.

## 7. Offline Training (Recommended)

Training and inference have been separated, **training should be executed through offline tasks**, do not trigger during API calls.

Training entry:

```bash
python3 train_offline.py --store-id 123
python3 train_offline.py --all
```

It is recommended to create a **Scheduled Task (weekly trigger)** in ECS, and keep a **manually triggered** one-time task.
Training tasks and inference services should share the same model directory (`MODEL_DIR`), recommend mounting **EFS** to `/app/models`.

## 8. Production Recommendations

1. Put model files in the image (simple) or mount EFS/S3 for pulling (more flexible).
2. Configure ALB + health check `/health` for ECS Service.
3. Set up CloudWatch alarms (5xx, CPU, memory).
4. Add authentication to `POST /predict` (API Gateway or application-layer token).
