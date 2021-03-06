const recruitUnits = require("../game/recruit/recruit-units");
const showRecruitsEmbed = require("../game/recruit/show-available-recruits");

module.exports = {
	name: "recruit",
	description: "recruit commands.",
	aliases: ["r"],
	shortcuts: {
		pe: "peasant",
        mi: "militia",
        gu: "guardsman",
        hu: "huntsman",
        ar: "archer",
        ra: "ranger",
	},
	execute(message, args, user) {
		if(args.length === 0) return message.channel.send(showRecruitsEmbed(user));

		const unit = Math.floor(args[args.length - 1]) ? args.slice(0, args.length - 1).join(" ") : args.slice(0, args.length).join(" ");
		const amount = Math.floor(args[args.length - 1]) || 1;

		recruitUnits(user, unit, amount).then((response) => {
			message.channel.send(`<@${message.author.id}>: ${response}`);
		});
	},
};