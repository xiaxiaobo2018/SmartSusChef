# Prophet + Tree 残差堆叠原理说明

本文总结 `Final_model.py` 中 Prophet 与树模型（XGBoost/CatBoost/LightGBM）如何链接，并解释其数学原理。

## 一、总体思路：残差堆叠（Residual Stacking）

目标是把时间序列拆成两部分：
- 可解释的趋势/季节性/节假日/外生变量部分（由 Prophet 建模）
- 复杂的非线性残差部分（由树模型学习）

最终预测：

yhat_t = yhat_prophet_t + yhat_resid_t

## 二、Prophet 部分：解释性结构

Prophet 形式化为：

y_t = g(t) + s(t) + h(t) + beta^T x_t + e_t

其中：
- g(t)：趋势项（分段线性或逻辑增长）
- s(t)：季节性
- h(t)：节假日效应
- x_t：外生回归变量（这里是天气）
- e_t：误差项

`Final_model.py` 中的实现：
- `_fit_prophet()` 用 `PROPHET_PARAMS` 建模趋势/季节/假期
- `m.add_regressor(col)` 把天气作为回归变量
- `_prophet_predict()` 得到 prophet_yhat

## 三、残差建模：树模型学习非线性结构

定义残差：

resid_t = y_t - yhat_prophet_t

残差作为树模型的监督目标：

yhat_resid_t = f_theta(features_t)

树模型使用的特征包括：
- 时间特征（day_of_week, month, day, dayofyear, is_weekend）
- 节假日特征（is_public_holiday）
- 天气特征（WEATHER_COLS）
- 滞后与滚动统计特征（y_lag_1/7/14, rolling mean/std）
- Prophet 预测值（prophet_yhat）

`Final_model.py` 中的实现：
- `_build_residual_features()` 生成 prophet_yhat 和 resid
- `TREE_FEATURES` 定义树模型输入
- `_eval_hybrid_mae()` 训练树模型并预测残差

## 四、最终预测：加和得到输出

最终预测：

yhat_t = yhat_prophet_t + yhat_resid_t

`Final_model.py` 中的实现：
- 交叉验证中：`yhat = prophet_test + resid_pred`
- 未来预测中：`yhat = prophet_yhat + resid_hat`

## 五、模型选择策略

对每道菜品分别优化三种模型：
- XGBoost
- CatBoost
- LightGBM

用时间序列扩展窗口 CV 评估 MAE，选择 MAE 最小的模型作为冠军模型。

相关实现：
- `_generate_cv_folds()`：时间序列 CV
- `_optimize_hybrid()`：Optuna 搜索超参
- `process_dish()`：选择最优模型并全量重训

## 六、总结

该方法将 Prophet 的可解释性与树模型的非线性拟合能力结合：

- Prophet 抓住宏观趋势、季节性和节假日影响
- 树模型学习 Prophet 未能解释的残差结构

从数学上等价于对时间序列进行加性分解，再对残差做非线性回归。

