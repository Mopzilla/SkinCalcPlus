window.scplus2 = window.scplus2 || {};


scplus2.generate_giveaway_page = async function() {
    const url = $(location).attr("href").toString();
    const selector = `div.container.sm.skins-list`;

    if (!url.includes("/cases/")) {
        alert(".skins-list found on a non-giveaway page");
        return;
    }

    if (!$(selector).length) {
        alert(".skins-list not found despite being found earlier");
        return
    }

    const case_name = url.split("/").pop();
    let case_json, odds_json;
    try {
        case_json = await $.getJSON(`https://gate.skin.club/apiv2/cases/${case_name}`);
        case_json = case_json.data;
        odds_json = case_json.last_successful_generation.contents;
        odds_json.sort((a, b) => b.fixed_price - a.fixed_price);
    } catch (err) {
        alert(`failed to get api data for "` + case_name + `"`);
        return;
    }

    let skins = {};
    for (key in odds_json) {
        const entry = odds_json[key];
        const skin_key = `${entry.item.name} ${entry.item.finish}`;

        if (!(skin_key in skins)) {
            skins[skin_key] = {};
            skins[skin_key].weapon = entry.item.name;
            skins[skin_key].finish = entry.item.finish;
            skins[skin_key].variants = [];
        }

        let skin_variant = {}
        skin_variant.wear = get_wear_shorthand(entry.item.exterior);
        skin_variant.stattrack = entry.item.specifics;
        skin_variant.range = `${entry.range_min}-${entry.range_max}`;
        skin_variant.price = parseFloat(entry.fixed_price) / 100;
        skin_variant.chance = parseFloat(entry.chance_percent);
        skins[skin_key].variants.push(skin_variant);
    }

    for (key in skins) {
        if (skins[key].variants.length == 1) {
            skins[key].price = `$${skins[key].variants[0].price.toFixed(2)}`;
            skins[key].chance = `${skins[key].variants[0].chance.toFixed(3)}%`;
        } else {
            let min_price = Infinity;
            let max_price = 0;
            let total_chance = 0;

            for (v_key in skins[key].variants) {
                const variant = skins[key].variants[v_key];
                min_price = Math.min(min_price, variant.price);
                max_price = Math.max(max_price, variant.price);
                total_chance += variant.chance;
            }

            skins[key].price = `$${min_price.toFixed(2)} - $${max_price.toFixed(2)}`;
            skins[key].chance = `${total_chance.toFixed(3)}%`;
        }
    }

    const give_prefix = scplus2.prefix + "-g734";
    ensure_stats_remain();


    async function ensure_stats_remain() {
        let attempts = 0;

        while (attempts < 30) {
            if ($(location).attr("href").toString() != url) {
                break;
            }

            if (!$(`.${give_prefix}-chance-container`).length) {
                try {
                    add_stats();
                } catch (error) {
                    if (error == "failed_load") {
                        alert("skin's didn't load");
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        return;
    }


    async function add_stats() {
        let attempts = 0;

        while (attempts < 30) {
            if ($(location).attr("href").toString() != url) {
                throw new Error("left_page");
            }

            if ($(`${selector} .case-skin`).length === Object.keys(skins).length) {
                generate();
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        throw new Error("failed_load");
    }


    function generate() {
        for (id in skins) {
            const in_dom = $(`${selector} img[alt="${id}"]`);
            if(!in_dom.length) {
                alert(`${id} doesn't exist, despite existing earlier`);
                return;
            }

            const skin_cont = in_dom.parent().parent();
            skin_cont.append(`

                <div class="${give_prefix}-chance-container">
                    <p class="${give_prefix}-chance-header">CHANCE</p>
                    <p class="${give_prefix}-chance-text">${skins[id].chance}</p>
                </div>

                <div class="${give_prefix}-price-container">
                    <p class="${give_prefix}-price-header">PRICE</p>
                    <p class="${give_prefix}-price-text"">${skins[id].price}</p>
                </div>

                <div class="${give_prefix}-table-wrapper">
                    <div class="${give_prefix}-table-row" style="
                            margin-bottom: 10px;
                            color: #9793C7;
                            font-weight: 700;
                            font-size: 10px;
                    ">
                        <div class="${give_prefix}-table-cell"
                                style="flex-basis: 35%;"
                        >PRICE</div>
                        <div class="${give_prefix}-table-cell"
                                style="flex-basis: 40%;"
                        >RANGE</div>
                        <div class="${give_prefix}-table-cell"
                                style="flex-basis: 25%;"
                        >ODDS</div>
                    </div>
                </div>

            `);

            for (v_key in skins[id].variants) {
                const variant = skins[id].variants[v_key];

                $(skin_cont).children(`.${give_prefix}-table-wrapper`).append(`
                    <div class="${give_prefix}-table-row" style="
                            color: #fff;
                            font-weight: 600;
                            font-size: 9px;
                    ">
                        <div class="${give_prefix}-table-cell" style="flex-basis: 35%;">
                            <span style="color: ${variant.stattrack 
                                ? "#F2754E" 
                                : "#fff"}">${variant.wear}</span>
                            <span style="color: #26c897;">${variant.price}</span>
                        </div>
                        <div
                                class="${give_prefix}-table-cell"
                                style="flex-basis: 40%;"
                        >${variant.range}</div>
                        <div
                                class="${give_prefix}-table-cell"
                                style="flex-basis: 25%;"
                        >${variant.chance.toFixed(3)}%</div>
                    </div>
                `);
            }
        }
    }


    function get_wear_shorthand(wear) {
        switch(wear) {
            case "Factory New":
                return "FN";
            case "Minimal Wear":
                return "MW";
            case "Field-Tested":
                return "FT";
            case "Well-Worn":
                return "WW";
            case "Battle-Scarred":
                return "BS";
            default:
                return "";
        }
    }
}