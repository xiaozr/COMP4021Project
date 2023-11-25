const Avatar = (function() {
    // This stores the available avatars
    const avatars = {
        "Land Animals": {
            "Hamster": "&#128057;",
            "Rabbit Face": "&#128048;",
            "Rabbit": "&#128007;",
            "Hedgehog": "&#129428;",
            "Bat": "&#129415;",
            "Bear": "&#128059;",
            "Koala": "&#128040;",
            "Panda": "&#128060;",
            "Kangaroo": "&#129432;",
            "Badger": "&#129441;"
        },
        "Birds": {
            "Turkey": "&#129411;",
            "Chicken": "&#128020;",
            "Rooster": "&#128019;",
            "Hatching Chick": "&#128035;",
            "Baby Chick 1": "&#128036;",
            "Baby Chick 2": "&#128037;",
            "Bird": "&#128038;",
            "Penguin": "&#128039;",
            "Eagle": "&#129413;",
            "Duck": "&#129414;",
            "Swan": "&#129442;",
            "Owl": "&#129417;",
            "Peacock": "&#129434;",
            "Parrot": "&#129436;"
        },
        "Amphibian/Reptile": {
            "Frog": "&#128056;",
            "Crocodile": "&#128010;",
            "Turtle": "&#128034;",
            "Lizard": "&#129422;",
            "Snake": "&#128013;",
            "Dragon Head": "&#128050;",
            "Dragon": "&#128009;",
            "Sauropod": "&#129429;",
            "T-Rex": "&#129430;"
        },
        "Sea Animals": {
            "Spouting Whale": "&#128051;",
            "Whale": "&#128011;",
            "Dolphin": "&#128044;",
            "Fish": "&#128031;",
            "Tropical Fish": "&#128032;",
            "Blowfish": "&#128033;",
            "Shark": "&#129416;",
            "Octopus": "&#128025;",
            "Spiral Shell": "&#128026;"
        },
        "Insects": {
            "Snail": "&#128012;",
            "Butterfly": "&#129419;",
            "Bug": "&#128027;",
            "Ant": "&#128028;",
            "Honeybee": "&#128029;",
            "Lady Beetle": "&#128030;",
            "Cricket": "&#129431;",
            "Scorpion": "&#129410;",
            "Mosquito": "&#129439;",
            "Microbe": "&#129440;"
        }
    };

    // This function populates the avatars to a select box
    const populate = function(select) {
        for (const category in avatars) {
            const optgroup = $("<optgroup label='" + category + "'></optgroup");
            for (const name in avatars[category]) {
                optgroup.append(
                    $("<option value='" + name + "'>" +
                      avatars[category][name] + " " + name +
                      "</option>")
                );
            }
            select.append(optgroup);
        }
    };

    // This function gets the code from the avatar name
    const getCode = function(name) {
        for (const category in avatars) {
            if (name in avatars[category])
                return avatars[category][name];
        }
        return "&#128683;";
    };

    return { populate, getCode };
})();
