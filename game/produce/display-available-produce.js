const Discord = require("discord.js");
const icons = require("../../icons/icons");
const buildingsObj = require("../build/buildings-object");

const produceEmbed = (user) => {
    const title = `${user.account.username}'s available productions`;
    const sideColor = "#45b6fe";
    const prodBuildings = user.empire.filter(b => b.producing).sort((a, b)=> b.level - a.level).reduce((acc, cur) =>{
        if(acc.find(a => a.name === cur.name)) return acc;
        else return[...acc, cur];
    }, []);

    const currentProdField = prodBuildings.map(building => {
       return {
            name: `${building.name.capitalize()}'s current production`,
           value: resourceMessage(building),
           inline: true,
       };
    });

    if(currentProdField.length === 0) {
        currentProdField.push({
            name: "You do not own any buildings that are able to produce resources. Build a mine or lumbermill.",
            value: "\u200B",
        });
    }

    if((currentProdField.length + 2) % 3) {
        currentProdField.push({
            name: "\u200B",
            value: "\u200B",
            inline: true,
        });
    }

    const availableProduces = prodBuildings.map(b => {
        return buildingsObj[b.name].levels.filter(lvl => lvl.level <= b.level);
    }).flat();

    const availableProdFields = {
            name: "Available productions:",
            value: produceMessage(availableProduces),
        };

	const produceRecruit = new Discord.MessageEmbed()
		.setTitle(title)
		.setColor(sideColor)
		.addFields(
			...currentProdField, availableProdFields,
		);

	// .setFooter(`PVP: #${pvpRank} ~~~ Total: #${totalRank}`);
	return produceRecruit;
};

const resourceMessage = (buildObj) => {
	let message = "";

	message += `${icons[buildObj.producing]} ${buildObj.producing.capitalize()}\n`;

	return message;
};

const produceMessage = (prod) => {
    let message = "";

    prod.forEach(p => {
        message += ` ${icons[p.produce]} ${p.produce.capitalize()}\n`;
    });

    return message;
};

module.exports = produceEmbed;