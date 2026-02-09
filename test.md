# ML Test/CI 记录

日期: 2026-02-09
范围: ML 模块 CI/CD 维护与测试集成

## 目标
- 在 CI 中集成 `Ruff`、`mypy`、`Bandit`、`pytest`、`JMeter`
- 统一 ML 校验流程于 PR 验证与 AWS 部署流水线

## 已完成内容
- PR 验证流程新增 ML 校验:
  - Ruff lint
  - mypy 类型检查
  - Bandit 安全扫描
  - pytest 单测
  - JMeter 健康检查 (FastAPI `/health`)
- AWS 部署流水线 ML 阶段替换旧 flake8，统一使用上述工具
- 新增 ML 质量/安全配置与依赖:
  - `ML/requirements-dev.txt`
  - `ML/ruff.toml`
  - `ML/mypy.ini`
  - `ML/bandit.yaml`
  - `ML/tests/jmeter/healthcheck.jmx`

## CI 关键配置
- Python 版本: 3.11 (与 `ML/Dockerfile` 对齐)
- JMeter: 使用系统包安装，执行健康检查脚本
- FastAPI 端口: 127.0.0.1:8000

## 执行入口
- PR 验证: `.github/workflows/pr-validation.yml` 的 `ml-validate` job
- AWS 流水线: `.github/workflows/aws-deploy.yml` 的 `ml-build` job

## 备注
- 你移动/替换的历史数据与脚本文件保持不变，未作处理
- 若需要本地一键脚本，可另行补充
