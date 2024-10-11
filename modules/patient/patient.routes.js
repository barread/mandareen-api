const router = require("express").Router();
const patientController = require("./patient.controller");

//** LOGIN **\\
router.route("/patient/login/").post(patientController.login);
router.route("/patient/authentificate/").post(patientController.authentificate);

//** PERSONAL INFORMATION **\\
router.route("/patients/account/patients/:id").get(patientController.findById);
router.route("/patient/timePassedOnPage").post(patientController.timePassedOnPage);
router.route("/patient/changeEmail/").post(patientController.changeEmail);
router.route("/patient/changePassword/").post(patientController.changePassword);
router.route("/patient/sendEmailPassword/").post(patientController.sendEmailPassword);

//** DIARY **\\
router.route("/patient/diary/").post(patientController.createDiary);
router.route("/patient/diary/").put(patientController.updateDiary);
router.route("/patient/diaries/:id").get(patientController.getAllPatientDiaries);

//** RECIPES **\\
router.route("/patient/getAllRecipesNames/").get(patientController.getAllRecipesNames);
router.route("/patient/recipes/").post(patientController.getAllRecipes);

//** RECIPES FAVORITE **\\
router.route("/patient/favoriteRecipes/").post(patientController.getAllFavoriteRecipes);
router.route("/patient/mostLikedRecipes").get(patientController.getMostLikedRecipes);
router.route("/patient/addRecipeToFavorite/").post(patientController.addRecipeToFavorite);
router.route("/patient/removeRecipeFromFavorite/").post(patientController.removeRecipeFromFavorite);
router.route("/patient/isRecipeFavorite/").post(patientController.isRecipeFavorite);

//** RECIPES DETAILS **\\
router.route("/patient/recipeDetails/:id").get(patientController.getRecipeDetails);
router.route("/patient/likeRecipe/").post(patientController.likeRecipe);
router.route("/patient/unlikeRecipe/").post(patientController.unlikeRecipe);
router.route("/patient/isRecipeLiked/").post(patientController.isRecipeLiked);

//** MUSIQUE **\\
router.route("/patient/spotify/authorize/").post(patientController.spotifyAuthorize);
router.route("/patient/spotify/authorizationCode/").post(patientController.spotifyGetAuthorizationCode);
router.route("/patient/spotify/refreshToken/").post(patientController.spotifyRefreshToken);
router.route("/patient/spotify/userInfo/:access_token").get(patientController.spotifyGetUserInfo);

//** SEANCE **\\
router.route("/patient/getSeanceInProgress/:id").get(patientController.getSeanceInProgress);
router.route("/patient/seance/get/:id").get(patientController.getSeanceData);
router.route("/patient/seance/send/1").post(patientController.sendSeanceData1);
router.route("/patient/seance/send/2").post(patientController.sendSeanceData2);
router.route("/patient/seance/send/3").post(patientController.sendSeanceData3);
router.route("/patient/seance/send/4").post(patientController.sendSeanceData4);
router.route("/patient/seance/send/5").post(patientController.sendSeanceData5);

//** OBJECTIVES **\\
router.route("/patient/sendNotificationData/").post(patientController.sendNotificationData);
router.route("/patient/objectives/:id").get(patientController.getObjectivesByPatient);
router.route("/patient/objective/id/:id").get(patientController.getCurrentObjective);
router.route("/patient/todayObjSport/:id").get(patientController.getTodayObjSport);
router.route("/patient/addObjSport/").post(patientController.addObjSport);
router.route("/patient/objSportDone/").put(patientController.setObjSportToDone);
router.route("/patient/objSport/delete/:id").delete(patientController.deleteObjSport);
router.route("/patient/todayObjMeal/:id").get(patientController.getTodayObjMeal);
router.route("/patient/addObjMeal/").post(patientController.addObjMeal);
router.route("/patient/objMealDone/").put(patientController.setObjMealToDone);
router.route("/patient/objMeal/delete/:id").delete(patientController.deleteObjMeal);
router.route("/patient/addObjOther/").post(patientController.addObjOther);

//** BUG REPORT **\\
router.route("/patient/bug/send").post(patientController.send);

module.exports = router;
