var self = this,
	models, 
	redisClient;

exports.config = function(m, r){
	models = m;
	redisClient = r;
	return this;
};

// ************************************
//				GET
// ************************************
exports.getIndex = function (req, res){
	res.render('index.html');
};


// ************************************
//				POST
// ************************************
exports.postLogin = function (req, res){

	if (!req.param('email') || !req.param('pass')) return res.send(401);

	if (req.param('email').toLowerCase() != 'amir@dashbook.co' 
		&& req.param('email').toLowerCase() != 'mo@dashbook.co') return res.send(401);

	if (req.param('email').toLowerCase() == 'amir@dashbook.co' 
		&& req.param('pass') == 'Yhs4#l:a@=Qs_yC!') return res.send(200);

	if (req.param('email').toLowerCase() == 'mo@dashbook.co' 
		&& req.param('pass') == 'G@dxAkMhg_9%2B>z') return res.send(200);

	return res.send(401);
};
exports.postSearch = function (req, res){

	if (!req.param('query')) return res.send(400);

	models.WaitingListEntry.find({ 
        'email': { 
            '$regex': '\w*'+req.param('query')+'\w*', 
            '$options': 'i'
        }
    })
	.exec(function(error, wles){
		if (error) {
			res.send(500);
			throw error;
		}
		return res.send(wles);
	});
};
exports.postQuery = function (req, res){
	models.WaitingListEntry.find(req.body)
	.exec(function(error, wles){
		if (error) {
			res.send(500);
			throw error;
		}
		return res.send(wles);
	});
};
exports.postConfirmUser = function (req, res){
	console.log(req.body);
	if (!req.param('confirmed_by') 
		|| (
			req.param('confirmed_by') != 'amir@dashbook.co' 
			&& req.param('confirmed_at') != 'mo@dashbook.co'
		) 
		|| !req.param('email') 
		|| !req.param('uuids') ) return res.send(400);

	models.WaitingListEntry.update({
		email: req.param('email') 
	}, {
		status: 3,
		confirmed: true,
		confirmed_by: req.param('confirmed_by'),
		confirmed_at: req.param('confirmed_at'),
	}, function(error) {
		if (error) {
			res.send(500)
			throw error;
		}

		redisClient.hmset('confirmed:'+req.param('email'), 
			'confirmed_by', req.param('confirmed_by'), 
			'confirmed_at', req.param('confirmed_by') );

		for (var i = 0; i < req.param('uuids').length; ++ i) {
			redisClient.hmset('user:'+req.param('uuids')[i], 'email', req.param('email'), 'status', 3);
		}
		return res.send(200);
	});
};
