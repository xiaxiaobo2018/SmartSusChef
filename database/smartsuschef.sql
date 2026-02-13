-- MySQL dump 10.13  Distrib 8.4.8, for Win64 (x86_64)
--
-- Host: oversea.zyh111.icu    Database: smartsuschef
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ForecastData`
--

DROP TABLE IF EXISTS `ForecastData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ForecastData` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `StoreId` int NOT NULL,
  `RecipeId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ForecastDate` datetime(6) NOT NULL,
  `PredictedQuantity` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_ForecastData_RecipeId` (`RecipeId`),
  KEY `IX_ForecastData_StoreId` (`StoreId`),
  CONSTRAINT `FK_ForecastData_Recipes_RecipeId` FOREIGN KEY (`RecipeId`) REFERENCES `Recipes` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_ForecastData_Store_StoreId` FOREIGN KEY (`StoreId`) REFERENCES `Store` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GlobalCalendarSignals`
--

DROP TABLE IF EXISTS `GlobalCalendarSignals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GlobalCalendarSignals` (
  `Date` datetime(6) NOT NULL,
  `IsHoliday` tinyint(1) NOT NULL,
  `HolidayName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsSchoolHoliday` tinyint(1) NOT NULL,
  `RainMm` decimal(10,2) NOT NULL,
  `WeatherDesc` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`Date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GlobalIngredients`
--

DROP TABLE IF EXISTS `GlobalIngredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GlobalIngredients` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CarbonFootprint` decimal(18,3) NOT NULL,
  `IsDefault` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_GlobalIngredients_Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `HolidayCalendars`
--

DROP TABLE IF EXISTS `HolidayCalendars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HolidayCalendars` (
  `CountryCode` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Year` int NOT NULL,
  `HolidaysJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`CountryCode`,`Year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Ingredients`
--

DROP TABLE IF EXISTS `Ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ingredients` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `StoreId` int NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CarbonFootprint` decimal(18,3) NOT NULL,
  `GlobalIngredientId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Ingredients_StoreId_Name` (`StoreId`,`Name`),
  KEY `IX_Ingredients_GlobalIngredientId` (`GlobalIngredientId`),
  CONSTRAINT `FK_Ingredients_GlobalIngredients_GlobalIngredientId` FOREIGN KEY (`GlobalIngredientId`) REFERENCES `GlobalIngredients` (`Id`),
  CONSTRAINT `FK_Ingredients_Store_StoreId` FOREIGN KEY (`StoreId`) REFERENCES `Store` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `RecipeIngredients`
--

DROP TABLE IF EXISTS `RecipeIngredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RecipeIngredients` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `RecipeId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `IngredientId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `ChildRecipeId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_RecipeIngredients_ChildRecipeId` (`ChildRecipeId`),
  KEY `IX_RecipeIngredients_IngredientId` (`IngredientId`),
  KEY `IX_RecipeIngredients_RecipeId` (`RecipeId`),
  CONSTRAINT `FK_RecipeIngredients_Ingredients_IngredientId` FOREIGN KEY (`IngredientId`) REFERENCES `Ingredients` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_RecipeIngredients_Recipes_ChildRecipeId` FOREIGN KEY (`ChildRecipeId`) REFERENCES `Recipes` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_RecipeIngredients_Recipes_RecipeId` FOREIGN KEY (`RecipeId`) REFERENCES `Recipes` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Recipes`
--

DROP TABLE IF EXISTS `Recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Recipes` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `StoreId` int NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  `IsSubRecipe` tinyint(1) NOT NULL,
  `IsSellable` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Recipes_StoreId_Name` (`StoreId`,`Name`),
  CONSTRAINT `FK_Recipes_Store_StoreId` FOREIGN KEY (`StoreId`) REFERENCES `Store` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SalesData`
--

DROP TABLE IF EXISTS `SalesData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SalesData` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `StoreId` int NOT NULL,
  `Date` datetime(6) NOT NULL,
  `RecipeId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Quantity` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_SalesData_StoreId_Date_RecipeId` (`StoreId`,`Date`,`RecipeId`),
  KEY `IX_SalesData_RecipeId` (`RecipeId`),
  CONSTRAINT `FK_SalesData_Recipes_RecipeId` FOREIGN KEY (`RecipeId`) REFERENCES `Recipes` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_SalesData_Store_StoreId` FOREIGN KEY (`StoreId`) REFERENCES `Store` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Store`
--

DROP TABLE IF EXISTS `Store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Store` (
  `Id` int NOT NULL,
  `CompanyName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UEN` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StoreName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OutletLocation` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OpeningDate` datetime(6) NOT NULL,
  `Latitude` decimal(10,7) NOT NULL,
  `Longitude` decimal(10,7) NOT NULL,
  `CountryCode` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ContactNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `StoreId` int NOT NULL,
  `Username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Role` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UserStatus` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT (_utf8mb4'Active'),
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Users_Username` (`Username`),
  KEY `IX_Users_StoreId` (`StoreId`),
  CONSTRAINT `FK_Users_Store_StoreId` FOREIGN KEY (`StoreId`) REFERENCES `Store` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WastageData`
--

DROP TABLE IF EXISTS `WastageData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WastageData` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `StoreId` int NOT NULL,
  `Date` datetime(6) NOT NULL,
  `IngredientId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `RecipeId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_WastageData_IngredientId` (`IngredientId`),
  KEY `IX_WastageData_RecipeId` (`RecipeId`),
  KEY `IX_WastageData_StoreId` (`StoreId`),
  CONSTRAINT `FK_WastageData_Ingredients_IngredientId` FOREIGN KEY (`IngredientId`) REFERENCES `Ingredients` (`Id`),
  CONSTRAINT `FK_WastageData_Recipes_RecipeId` FOREIGN KEY (`RecipeId`) REFERENCES `Recipes` (`Id`),
  CONSTRAINT `FK_WastageData_Store_StoreId` FOREIGN KEY (`StoreId`) REFERENCES `Store` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WeatherDaily`
--

DROP TABLE IF EXISTS `WeatherDaily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WeatherDaily` (
  `StoreId` int NOT NULL,
  `Date` datetime(6) NOT NULL,
  `Temperature` decimal(10,2) NOT NULL,
  `Condition` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Humidity` int NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`StoreId`,`Date`),
  CONSTRAINT `FK_WeatherDaily_Store_StoreId` FOREIGN KEY (`StoreId`) REFERENCES `Store` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `__EFMigrationsHistory`
--

DROP TABLE IF EXISTS `__EFMigrationsHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__EFMigrationsHistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'smartsuschef'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-13 12:33:42
