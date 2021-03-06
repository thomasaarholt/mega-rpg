const { onCooldown } = require("../_CONSTS/cooldowns");
const { worldLocations } = require("../_CONSTS/explore");
const { getLocationIcon } = require("../_CONSTS/icons");
const { calculatePveHero } = require("../../combat/combat");
const { generateEmbedPveHero } = require("../../combat/pveEmedGenerator");

const handleHunt = async (user, place = null) => {

    // checks for cooldown
    const cooldownInfo = onCooldown("hunt", user);
    if (cooldownInfo.response) {
        return cooldownInfo.embed;
    }

    // checks for too low hp
    if (user.hero.currentHealth < user.hero.health * 0.05) {
        return `Your hero's health is too low (**${user.hero.currentHealth}**)`;
    }

    const { currentLocation } = user.world;
    const placesInCurrentWorld = worldLocations[currentLocation].places;
    const locationIcon = getLocationIcon(currentLocation);

    const userExploredPlaces = user.world.locations[currentLocation].explored;
    const userExploredHuntPlaces = userExploredPlaces
    .filter(p=>{
        return placesInCurrentWorld[p].type === "hunt";
    })
    .map(p=>{
        return p.replace(/\s/g, "").toLowerCase();
    });

    // checks if user has explored any huntable places in current location
    if (!userExploredHuntPlaces.length) {
        return `You have not explored any place to hunt in ${locationIcon} ${currentLocation}, try \`!explore\` to find a place to hunt`;
    }

     const userExploredNotHuntPlaces = userExploredPlaces
     .filter(p=>{
        return placesInCurrentWorld[p].type !== "hunt";
    })
     .map(p=>{
        return p.replace(/\s/g, "").toLowerCase();
    });

    // if user tries to hunt a place that is not huntable
    if (userExploredNotHuntPlaces.includes(place)) {
        return "This place cannot be hunted";
    }

    let placeInfo;

    // if user wants to hunt a specific place
    if (place) {
        placeInfo = Object.values(placesInCurrentWorld).find(p=>{
        const friendlyFormat = p.name.replace(/\s/g, "").toLowerCase();
        return friendlyFormat === place;

        // if we want to make it user friendly
        // and let the user type in the first 4 letters of the place
        // but then we can't 4 places starting with 'bandit'
        // friendlyFormat.slice(0, 4) === place.slice(0, 4)
    });
}
 else {
     // if user doesn't provide a specific place to hunt, the user will be given a random place

    const listOfPlaces = Object.values(placesInCurrentWorld).filter(p=>{
        const friendlyFormat = p.name.replace(/\s/g, "").toLowerCase();
        return userExploredHuntPlaces.includes(friendlyFormat);
    });
    placeInfo = listOfPlaces[Math.floor(Math.random() * listOfPlaces.length)];

 }

 // if user tries to hunt that doesn't exist
 if (!placeInfo) {
     if (place.length > 10) {
         place = `${place.slice(0, 10)}[...]`;
     }
    return `${place} does not exist in ${locationIcon} ${currentLocation}. Use !look to see your surroundings`;
}

    // calculates result
 const huntResult = calculatePveHero(user, placeInfo);

 // saves to database
 const now = new Date();
await user.setNewCooldown("hunt", now);
await user.heroHpLoss(huntResult.lossPercentage);
await user.alternativeGainXp(huntResult.expReward);

if (huntResult.win) {
    await user.gainManyResources(huntResult.resourceReward);
}

// generates a Discord embed
    const huntEmbed = generateEmbedPveHero(user, placeInfo, huntResult);

 return huntEmbed;

};

module.exports = { handleHunt };