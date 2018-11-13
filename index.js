/**
 * Created by fipso on 13.10.16.
 */

const CryptoJS = require('crypto-js');
const request = require('request-promise-native');

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('400387579:AAEHuf2ih2So6JfbL3QRoXg9wiWbmNChBAo', {polling: true});

const CryptoJSAesJson = {
	stringify: function (cipherParams) {
		const j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
		if (cipherParams.iv) j.iv = cipherParams.iv.toString();
		if (cipherParams.salt) j.s = cipherParams.salt.toString();
		return JSON.stringify(j);
	},
	parse: function (jsonStr) {
		const j = JSON.parse(jsonStr);
		const cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)});
		if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
		if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
		return cipherParams;
	}
};

function build(score, url) {
	const timestamp = new Date().getTime();
	const hash = CryptoJS.AES.encrypt(JSON.stringify({
		score: score,
		timestamp: timestamp
	}), "crmjbjm3lczhlgnek9uaxz2l9svlfjw14npauhen", {
		format: CryptoJSAesJson
	}).toString();
	const sData = JSON.stringify({
		score: score,
		url: "/game-bot/" + url,
		play_time: 20,
		hash: hash
	});

	return sData;
}

bot.on('text', function (msg) {
	if (/^\/start/.exec(msg.text))
		bot.sendMessage(msg.chat.id, 'Send desired score and link of @gamee game. For example:\n' +
			'<pre>100 ' +
			'https://www.gameeapp.com/game-bot/GAMECODE~telegram:inline~0000000000000000000~00000000~Name~Some_Hash</pre>' +
			'\n\nBot by @kraso' +
			'\n\nHosted by @wankai',
			{parse_mode: 'HTML'});
	else {
		const info = msg.text.split(' ');

		const score = info[0];
		let url = '';
		try {
			url = /game-bot\/(.+)#tg/.exec(info[1])[1];
		} catch (err) {
			console.warn(err.message);
		}

		request.post({
				url: 'https://bots.gameeapp.com/set-web-score-qkfnsog26w7173c9pk7whg0iau7zwhdkfd7ft3tn',
				body: build(score, url)
			})

			.then(function (res) {
				console.log(res);
				bot.sendMessage(msg.chat.id, 'Done!');
			})

			.catch(function (err) {
				console.warn(err.message);
				bot.sendMessage(msg.chat.id, 'Something go wrong...');
			});
	}
});

bot.on('message', function (msg) {
	console.log(msg);
});
