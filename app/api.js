const authApiRoutes = require('./modules/auth/api.js');
const profileApiRoutes = require('./modules/profile/api.js');
const videoApiRoutes = require('./modules/videos/api.js');
const battleApiRoutes = require('./modules/battles/api.js');
const rankingApiRoutes = require('./modules/ranking/api.js');
const searchApiRoutes = require('./modules/search/api.js');


const configApiRoutes = (app) => {
	authApiRoutes(app);
	profileApiRoutes(app);
  	videoApiRoutes(app);
	battleApiRoutes(app);
	rankingApiRoutes(app);
	searchApiRoutes(app);
};

module.exports = configApiRoutes;
