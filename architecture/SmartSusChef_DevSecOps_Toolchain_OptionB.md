# SmartSusChef - DevSecOps Toolchain Architecture

*Shift-Left Security | Automated CI/CD | 3-Layer Monolith and ML Service Deployment*

```mermaid
flowchart LR
    %% ==================================================
    %% STYLE DEFINITIONS
    %% ==================================================
    classDef dev fill:#E8F5E9,stroke:#4CAF50,stroke-width:1.5px
    classDef sec fill:#FFEBEE,stroke:#E53935,stroke-width:1.5px
    classDef build fill:#E3F2FD,stroke:#1E88E5,stroke-width:1.5px
    classDef container fill:#EDE7F6,stroke:#5E35B1,stroke-width:1.5px
    classDef deploy fill:#F3E5F5,stroke:#8E24AA,stroke-width:1.5px
    classDef infra fill:#E0F7FA,stroke:#00838F,stroke-width:1.5px
    classDef monitor fill:#FFF8E1,stroke:#F9A825,stroke-width:1.5px

    %% ==================================================
    %% PLAN & CODE
    %% ==================================================
    subgraph DEV["PLAN & CODE"]
        dev["Developer"]
        vscode["VS Code"]
        github["GitHub Repo\n(main / PRs)"]
        localdev["Local Dev Scripts"]
        local_be[".NET 8 API\n:5000"]
        local_fe["React + Vite\n:5173"]
        local_ml["FastAPI ML\n:8000"]

        dev --> vscode --> github
        github --> localdev
        localdev --> local_be
        localdev --> local_fe
        localdev --> local_ml
    end
    class DEV,dev,vscode,github,localdev,local_be,local_fe,local_ml dev

    %% ==================================================
    %% CHANGE DETECTION
    %% ==================================================
    subgraph CD["CHANGE DETECTION"]
        pathfilter["dorny/paths-filter"]
        pf_be["backend/**"]
        pf_fe["frontend/**"]
        pf_ml["ML/**"]
        pf_mob["mobile/**"]
        pf_infra["infrastructure/**"]

        pathfilter --> pf_be
        pathfilter --> pf_fe
        pathfilter --> pf_ml
        pathfilter --> pf_mob
        pathfilter --> pf_infra
    end
    class CD,pathfilter,pf_be,pf_fe,pf_ml,pf_mob,pf_infra build

    github --> pathfilter

    %% ==================================================
    %% SECURITY SCANNING
    %% ==================================================
    subgraph SEC["SECURITY (Shift-Left)"]
        codeql["GitHub CodeQL\nSAST"]
        trivy_fs["Trivy FS Scan"]
        sec_dash["GitHub Security\nDashboard"]

        codeql --> sec_dash
        trivy_fs --> sec_dash
    end
    class SEC,codeql,trivy_fs,sec_dash sec

    pathfilter --> codeql
    pathfilter --> trivy_fs

    %% ==================================================
    %% BUILD & TEST
    %% ==================================================
    subgraph BUILD["BUILD & TEST (Parallel)"]
        build_be["Backend\n.NET 8"]
        build_fe["Frontend\nNode 20"]
        build_ml["ML\nPython 3.11"]
        build_mob["Mobile\nAndroid"]

        build_be -->|"restore / build / test"| build_be
        build_fe -->|"npm ci / build"| build_fe
        build_ml -->|"pip / pytest"| build_ml
        build_mob -->|"gradle build"| build_mob
    end
    class BUILD,build_be,build_fe,build_ml,build_mob build

    pathfilter -->|backend| build_be
    pathfilter -->|frontend| build_fe
    pathfilter -->|ML| build_ml
    pathfilter -->|mobile| build_mob

    %% ==================================================
    %% CONTAINER BUILD & SCAN
    %% ==================================================
    subgraph CONTAINER["CONTAINER BUILD & SCAN"]
        buildx["Docker Buildx"]
        ecr["Amazon ECR"]
        trivy_img["Trivy Image Scan"]

        buildx --> ecr --> trivy_img
    end
    class CONTAINER,buildx,ecr,trivy_img container

    build_be --> buildx
    build_fe --> buildx
    build_ml --> buildx

    %% ==================================================
    %% DEPLOYMENT
    %% ==================================================
    subgraph DEPLOY["DEPLOYMENT"]
        subgraph UAT["UAT"]
            uat_ecs["ECS Fargate (UAT)"]
            uat_db["RDS MySQL (UAT)"]
            uat_smoke["Smoke Tests"]

            uat_ecs --> uat_db
            uat_ecs --> uat_smoke
        end

        subgraph PROD["Production"]
            prod_ecs["ECS Fargate (Prod)"]
            prod_db["RDS MySQL (Prod)"]
            prod_alb["ALB + HTTPS"]

            prod_ecs --> prod_db
            prod_alb --> prod_ecs
        end

        secrets["GitHub Env Secrets"]
    end
    class DEPLOY,uat_ecs,uat_db,uat_smoke,prod_ecs,prod_db,prod_alb,secrets deploy

    trivy_img --> uat_ecs
    secrets --> uat_ecs
    uat_smoke --> prod_ecs
    secrets --> prod_ecs

    %% ==================================================
    %% INFRASTRUCTURE AS CODE
    %% ==================================================
    subgraph IAC["INFRASTRUCTURE AS CODE"]
        terraform["Terraform\n(VPC, ECS, ALB, RDS, ECR)"]
    end
    class IAC,terraform infra

    terraform -.-> UAT
    terraform -.-> PROD

    %% ==================================================
    %% MONITORING
    %% ==================================================
    subgraph MON["MONITORING & OBSERVABILITY"]
        cw["CloudWatch"]
        health["Health Endpoints"]
        gh_summary["GitHub Actions\nSummary"]

        cw --> gh_summary
    end
    class MON,cw,health,gh_summary monitor

    prod_ecs --> cw
    prod_ecs --> health

```

## Legend

| Color | Phase |
|-------|-------|
| 🟢 Green | Plan & Code |
| 🔴 Red | Security Scanning |
| 🔵 Blue | Build & Test |
| 🟣 Purple | Container & Image Scan |
| 🟣 Pink | Deployment |
| 🔷 Cyan | Infrastructure as Code |
| 🟡 Yellow | Monitoring |

## Key DevSecOps Practices

- **Shift-left**: CodeQL SAST on every push
- **Supply chain**: Trivy filesystem + image scans
- **Secrets**: GitHub Environment Secrets (not in code)
- **HTTPS enforced**: TLS 1.3, HTTP→HTTPS redirect
- **Least privilege**: ECS SG port-restricted
- **Selective CI**: path-based change detection
- **Parallel deploy**: 3 ECS services simultaneously
