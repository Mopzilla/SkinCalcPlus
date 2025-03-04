//
//
//
var stop = false;
event_loop();

$(document).on("change", 'input:checkbox[value="skin-calc-plus-toggle-odds"]', function() {
    if ($(this).is(":checked")) {
        // toggle values
        $("#skin-calc-plus-case-info-right").addClass("skin-calc-plus-show-old-gen");

        // change highlighted text
        $("#skin-calc-plus-genheader-prev").addClass("skin-calc-plus-active-generation");
        $("#skin-calc-plus-genheader-cur").removeClass("skin-calc-plus-active-generation");
    } else {
        // toggle values
        $("#skin-calc-plus-case-info-right").removeClass("skin-calc-plus-show-old-gen");

        // change highlighted text
        $("#skin-calc-plus-genheader-prev").removeClass("skin-calc-plus-active-generation");
        $("#skin-calc-plus-genheader-cur").addClass("skin-calc-plus-active-generation");
    }
});

function event_loop() {
    var case_name = $(location).attr("href");
    case_name = case_name.toString();

    // check if we are on a case page
    if (!case_name.includes("/cases/")) {
        setTimeout(event_loop, 500);
        return;
    }

    // check if the case page has loaded enough to continue
    var roulette_container = document.getElementsByClassName("roulette-case")[0];
    if (!roulette_container) {
        var is_giveaway = document.getElementsByClassName("giveaway-case");
        if (!is_giveaway) {
            setTimeout(event_loop, 500);
            return;
        }

        var giveaway_skin_list = document.getElementsByClassName("skins-list")[0];
        if (!giveaway_skin_list) {
            setTimeout(event_loop, 500);
            return;
        }

        var is_skin_list_modified = document.getElementsByClassName("skin-calc-plus-giveaway-odds-added")[0];
        if (is_skin_list_modified) {
            setTimeout(event_loop, 500);
            return;
        }

        case_name = case_name.split("/").pop();
        display_giveaway_odds(case_name);
        return;
    }

    // set odds update footer
    var odds_update = document.getElementsByClassName("title-check-odds-range")[0];
    if (!odds_update) {
        setTimeout(event_loop, 500);
        return;
    }

    // check if we have already created the case info
    var case_info = document.getElementById("skin-calc-plus-case-info");
    if (case_info) {
        setTimeout(event_loop, 500);
        return;
    }
    construct_case_info_elements(roulette_container);
    $("#skin-calc-plus-last-odds-update").text("odds" + odds_update.textContent.split("]").pop());

    // get case name from url and create an API link to its information
    case_name = case_name.split("/").pop();
    var case_url = "https://gate.skin.club/apiv2/cases/" + case_name;

    // get case data from API
    $.getJSON(case_url, function(data) {
        on_get_case_info(data, case_name);
    }).fail(function() {
        alert("Failed to get case data from API, execution stopped");
    });
}


function on_get_case_info(case_info, case_name) {
    var odds_id = case_info.data.last_successful_generation.uid.toString();
    var odds_url = "https://gate.skin.club/apiv2/odds/" + odds_id + "/contents";

    $.getJSON(odds_url, function(data) {
        on_get_case_odds(data, parseFloat((Number(case_info.data.price) / 100).toFixed(2)), case_name);
    }).fail(function() {
        alert('Failed to get "' + odds_id + '" odds from API, execution stopped');
    });
}


function on_get_case_odds(case_odds, case_price, case_name) {
    generate_values(case_odds, case_price);
    
    var odds_url = "https://gate.skin.club/apiv2/odds?page=2&per_page=1&sort_by=-id&filter[case_name]=" + case_name;

    $.getJSON(odds_url, function(data) {
        on_get_previous_odds(data);
    }).fail(function() {
        console.log('Failed to get previous odds for "' + case_name + '", revealing current odds');
        reveal_info(true);
    });
}


function on_get_previous_odds(prev_gen_info) {
    if (prev_gen_info.data.length == 0) {
        reveal_info(true);
        return;
    }

    var prev_odds_id = prev_gen_info.data[0].uid.toString();
    var prev_case_price = parseFloat((Number(prev_gen_info.data[0].case_price) / 100).toFixed(2))
    var odds_url = "https://gate.skin.club/apiv2/odds/" + prev_odds_id + "/contents";

    $.getJSON(odds_url, function(data) {
        generate_values(data, prev_case_price, "-old");
    }).fail(function() {
        console.log('Failed to get "' + prev_odds_id + '" odds from API, revealing current odds');
        reveal_info(true);
    });
}


function display_giveaway_odds(case_name) {
    var case_url = "https://gate.skin.club/apiv2/cases/" + case_name;

    // get case data from API
    $.getJSON(case_url, function(data) {
        on_get_giveaway_case_info(data);
    }).fail(function() {
        alert("Failed to get case data from API, execution stopped");
    });
}


function on_get_giveaway_case_info(case_info) {
    var odds_id = case_info.data.last_successful_generation.uid.toString();
    var odds_url = "https://gate.skin.club/apiv2/odds/" + odds_id + "/contents";

    $.getJSON(odds_url, function(data) {
        on_get_giveaway_case_odds(data);
    }).fail(function() {
        alert('Failed to get "' + odds_id + '" odds from API, execution stopped');
    });
}


function on_get_giveaway_case_odds(case_odds) {
    var skins = {};
    for (key in case_odds.data) {
        var item = case_odds.data[key];
        var skin_key = item.item["name"].toString() + " " + item.item["finish"].toString();

        if (!(skin_key in skins)) {
            skins[skin_key] = {};
            skins[skin_key]["weapon"] = item.item["name"];
            skins[skin_key]["skin"] = item.item["finish"];

            skins[skin_key]["items"] = [];
        }

        var skin_variant = {}
        skin_variant["finish"] = get_finish_shorthand(item.item.exterior);
        skin_variant["stattrack"] = item.item.specifics;
        skin_variant["range"] = item.range_min.toString() + "-" + item.range_max.toString();
        skin_variant["price"] = parseFloat(Number(item.fixed_price) / 100);
        skin_variant["chance"] = parseFloat(Number(item.chance_percent));

        skins[skin_key]["items"].push(skin_variant);
    }

    for (id in skins) {
        if (skins[id].items.length == 1) {
            skins[id]["price"] = "$" + skins[id].items[0].price.toFixed(2).toString();
            skins[id]["chance"] = skins[id].items[0].chance.toFixed(3).toString() + "%";
        } else {
            var min_price = 999999999;
            var max_price = 0;
            var total_chance = 0;

            for (variant in skins[id].items) {
                var vskin = skins[id].items[variant];
                if (vskin.price > max_price) {
                    max_price = vskin.price;
                }
                if (vskin.price < min_price) {
                    min_price = vskin.price;
                }
                total_chance += vskin.chance;
            }

            min_price = "$" + min_price.toFixed(2).toString();
            max_price = "$" + max_price.toFixed(2).toString();
            skins[id]["price"] = min_price + " - " + max_price;
            skins[id]["chance"] = total_chance.toFixed(3).toString() + "%";
        }
    }

    $(".skins-list").addClass("skin-calc-plus-giveaway-odds-added");
    $(".skins-list > div").each(function () {
        var skin = skins[$(this).find(".case-entity__image").attr("alt").toString()];
        $(this).append(`

            <div class="skin-calc-plus-giveaway-chance-container">
                <p class="skin-calc-plus-giveaway-chance-header">CHANCE</p>
                <p class="skin-calc-plus-giveaway-chance-text">${skin.chance}</p>
            </div>

            <div class="skin-calc-plus-giveaway-price-container">
                <p class="skin-calc-plus-giveaway-price-header">PRICE</p>
                <p class="skin-calc-plus-giveaway-price-text"">${skin.price}</p>
            </div>

            <div class="skin-calc-plus-giveaway-table-wrapper">
                <div class="skin-calc-plus-giveaway-table-row" style="margin-bottom: 10px; color: #9793c7; font-weight: 700; font-size: 10px;">
                    <div class="skin-calc-plus-giveaway-table-cell" style="flex-basis: 35%;">PRICE</div>
                    <div class="skin-calc-plus-giveaway-table-cell" style="flex-basis: 40%;">RANGE</div>
                    <div class="skin-calc-plus-giveaway-table-cell" style="flex-basis: 25%;">ODDS</div>
                </div>
            </div>

        `);

        for (variant in skin.items) {
            var vskn = skin.items[variant];
            var vprice = "$" + vskn.price.toFixed(2).toString();
            var vchance = vskn.chance.toFixed(3).toString() + "%";
            var vcol = "#fff";
            if (vskn.stattrack) {
                vcol = "#f2754e";
            }

            $(this).children(".skin-calc-plus-giveaway-table-wrapper").append(`
                <div class="skin-calc-plus-giveaway-table-row" style="color: #fff; font-weight: 600; font-size: 9px;">
                    <div class="skin-calc-plus-giveaway-table-cell" style="flex-basis: 35%;">
                        <span style="color: ${vcol}">${vskn.finish}</span>
                        <span style="color: #26c897;">${vprice}</span>
                    </div>
                    <div class="skin-calc-plus-giveaway-table-cell" style="flex-basis: 40%;">${vskn.range}</div>
                    <div class="skin-calc-plus-giveaway-table-cell" style="flex-basis: 25%;">${vchance}</div>
                </div>
            `);
        }
    });

    setTimeout(event_loop, 500);
    return;
}


function get_finish_shorthand(finish) {
    switch(finish) {
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


function getHexColorFromRange(min, avg, max, val) {
    var color_range = [
        "#fa3671",      // 0%
        "#FB6895",      // 12.5%
        "#FD9BB8",      // 25%
        "#FECDDC",      // 37.5%
        "#fff",         // 50%
        "#C9F1E5",      // 62.5%
        "#93E4CB",      // 75%
        "#5CD6B1",      // 87.5%
        "#26c897",      // 100%
    ];

    var val_normalized = 0.5 + ((val - avg) / (2 * (max - min)));
    var col_index = Math.round(val_normalized * (color_range.length - 1));

    return color_range[col_index];
}


function reveal_info(hide_old) {
    var case_info_cont = document.getElementById("skin-calc-plus-case-info");
    
    if (hide_old) {
        var generations_cont = document.getElementById("skin-calc-plus-generation-container");
        generations_cont.style = "display: none !important;";
    }

    case_info_cont.className = "skin-calc-plus-fade-in";
    setTimeout(event_loop, 500);
}


function construct_case_info_elements(parent) {
    var case_info_cont = document.createElement("div");
    case_info_cont.id = "skin-calc-plus-case-info";
    parent.appendChild(case_info_cont);

    case_info_cont.innerHTML = `
    
        <div id="skin-calc-plus-case-info-left" class="skin-calc-plus-case-info-child">
        </div>



        <div id="skin-calc-plus-case-info-right" class="skin-calc-plus-case-info-child">

            <div id="skin-calc-plus-generation-container">
                <label id="skin-calc-plus-generation-toggle">
                    <h5 id="skin-calc-plus-genheader-prev">PREVIOUS ODDS</h5>
                    <h5 id="skin-calc-plus-genheader-cur" class="skin-calc-plus-active-generation">CURRENT ODDS</h5>
                    <input type="checkbox" id="skin-calc-plus-generation-checkbox" value="skin-calc-plus-toggle-odds">
                </label>
            </div>

            <div class="skin-calc-plus-case-info-row">
                <h5>EXPECTED VALUE:</h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-total-ev-cases">?</span>
                        <span id="skin-calc-plus-total-ev-cases-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">AVG. CASES</span>
                    <span id="skin-calc-plus-total-ev-cases-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-total-ev-usd">?</span>
                        <span id="skin-calc-plus-total-ev-usd-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">TOTAL EV</span>
                    <span id="skin-calc-plus-total-ev-usd-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-total-ev-percent">?</span>
                        <span id="skin-calc-plus-total-ev-percent-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">AS PERCENT</span>
                    <span id="skin-calc-plus-total-ev-percent-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
            </div>

            <div class="skin-calc-plus-case-info-row">
                <h5>MEDIAN RETURN:</h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-median-case">?</span>
                        <span id="skin-calc-plus-median-case-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">CASE PRICE</span>
                    <span id="skin-calc-plus-median-case-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-median-usd">?</span>
                        <span id="skin-calc-plus-median-usd-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">&#x2248;50%</span>
                    <span id="skin-calc-plus-median-usd-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-median-percent">?</span>
                        <span id="skin-calc-plus-median-percent-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">AS PERCENT</span>
                    <span id="skin-calc-plus-median-percent-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
            </div>

            <div class="skin-calc-plus-case-info-row">
                <h5>BREAK EVEN ODDS:</h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-break-even-factor">?</span>
                        <span id="skin-calc-plus-break-even-factor-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">PROFIT FACTOR</span>
                    <span id="skin-calc-plus-break-even-factor-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-break-even-chance">?</span>
                        <span id="skin-calc-plus-break-even-chance-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">CHANCE</span>
                    <span id="skin-calc-plus-break-even-chance-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
            </div>

            <div class="skin-calc-plus-case-info-row">
                <h5>JACKPOT:</h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-jackpot-usd">?</span>
                        <span id="skin-calc-plus-jackpot-usd-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">JACKPOT EV</span>
                    <span id="skin-calc-plus-jackpot-usd-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-jackpot-factor">?</span>
                        <span id="skin-calc-plus-jackpot-factor-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">PROFIT FACTOR</span>
                    <span id="skin-calc-plus-jackpot-factor-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
                <h5>
                    <span class="skin-calc-plus-cell-value">
                        <span id="skin-calc-plus-jackpot-chance">?</span>
                        <span id="skin-calc-plus-jackpot-chance-old">?</span>
                    </span>
                    <span class="skin-calc-plus-cell-title">CHANCE</span>
                    <span id="skin-calc-plus-jackpot-chance-change" class="skin-calc-plus-prev-gen-change-indicator"></span>
                </h5>
            </div>

            <p id="skin-calc-plus-last-odds-update">ODDS UPDATED ? AGO</p>

        </div>

    `;
}


function generate_values(case_odds, case_price, old = "") {
    var total_ev = 0;
    var break_even_chance = 0;
    var break_even_factor = 0;
    var rarest_item_chance = 1.0;
    var median_item_chance = 1.0;
    var median_usd = 0;
    var exclusive_usd = 0;
    var exclusive_chance = 0;
    var jackpot_usd = 0;
    var jackpot_chance = 0;

    for (key in case_odds.data) {
        var item = case_odds.data[key];
        var item_price = parseFloat(Number(item.fixed_price) / 100);
        var item_chance = parseFloat(Number(item.chance_percent) / 100);

        if (item_price >= case_price) {
            break_even_chance += item_chance;
            break_even_factor += item_price * item_chance;
        }
        
        if (item_chance < rarest_item_chance) {
            rarest_item_chance = item_chance;
        }

        median_item_chance -= item_chance;
        if (median_item_chance <= 0.5 && !median_usd) {
            median_usd = item_price;
        }

        // to calculate jackpot values
        if (item.is_exclusive) {
            exclusive_usd += item_price * item_chance;
            exclusive_chance += item_chance;
        }

        // in case there are no exclusive items, we use the best item
        if (item_price > jackpot_usd) {
            jackpot_usd = item_price * item_chance;
            jackpot_chance = item_chance;
        }

        total_ev += item_price * item_chance;
    }

    // no exclusive drop, use best item instead
    if (!exclusive_chance) {
        exclusive_usd = jackpot_usd;
        exclusive_chance = jackpot_chance;
    }

    // Expected Value -> USD
    var val_total_ev_usd = total_ev;
    $("#skin-calc-plus-total-ev-usd" + old).text("$" + val_total_ev_usd.toFixed(2).toString());
    $("#skin-calc-plus-total-ev-usd" + old).data("value", val_total_ev_usd.toFixed(2));

    // Expected Value -> Percent
    var val_total_ev_percent = (total_ev / case_price) * 100;
    $("#skin-calc-plus-total-ev-percent" + old).text(val_total_ev_percent.toFixed(2).toString() + "%");
    $("#skin-calc-plus-total-ev-percent" + old).data("value", val_total_ev_percent.toFixed(2));

    // Expected Value -> Avg. Cases
    var val_total_ev_cases = 1 / rarest_item_chance;
    $("#skin-calc-plus-total-ev-cases" + old).text(Math.ceil(val_total_ev_cases).toString());
    $("#skin-calc-plus-total-ev-cases" + old).data("value", Math.ceil(val_total_ev_cases));

    // Break Even -> Profit Factor
    var val_even_fac = (break_even_factor / break_even_chance) / case_price;
    $("#skin-calc-plus-break-even-factor" + old).text(val_even_fac.toFixed(2).toString() + "x");
    $("#skin-calc-plus-break-even-factor" + old).data("value", val_even_fac.toFixed(2));

    // Break Even -> Chance
    var val_even_chance = break_even_chance * 100;
    $("#skin-calc-plus-break-even-chance" + old).text(val_even_chance.toFixed(2).toString() + "%");
    $("#skin-calc-plus-break-even-chance" + old).data("value", val_even_chance.toFixed(2));

    // Median Return -> Case Price
    $("#skin-calc-plus-median-case" + old).text("$" + case_price.toFixed(2).toString());
    $("#skin-calc-plus-median-case" + old).data("value", case_price.toFixed(2));

    // Median Return -> USD
    $("#skin-calc-plus-median-usd" + old).text("$" + median_usd.toFixed(2).toString());
    $("#skin-calc-plus-median-usd" + old).data("value", median_usd.toFixed(2));

    // Median Return -> Percent
    var val_median_percent = (median_usd / case_price) * 100;
    $("#skin-calc-plus-median-percent" + old).text(val_median_percent.toFixed(2).toString() + "%");
    $("#skin-calc-plus-median-percent" + old).data("value", val_median_percent.toFixed(2));

    // Jackpot -> USD
    $("#skin-calc-plus-jackpot-usd" + old).text("$" + (exclusive_usd / exclusive_chance).toFixed(2).toString());
    $("#skin-calc-plus-jackpot-usd" + old).data("value", (exclusive_usd / exclusive_chance).toFixed(2));

    // Jackpot -> Profit Factor
    $("#skin-calc-plus-jackpot-factor" + old).text(((exclusive_usd / exclusive_chance) / case_price).toFixed(2).toString() + "x");
    $("#skin-calc-plus-jackpot-factor" + old).data("value", ((exclusive_usd / exclusive_chance) / case_price).toFixed(2));

    // Jackpot -> Chance
    $("#skin-calc-plus-jackpot-chance" + old).text((exclusive_chance * 100).toFixed(2).toString() + "%");
    $("#skin-calc-plus-jackpot-chance" + old).data("value", (exclusive_chance * 100).toFixed(2));

    // Set Current EV Color
    if (!old) {
        $("#skin-calc-plus-total-ev-percent").css("color", getHexColorFromRange(89.5, 90, 90.5, val_total_ev_percent));
        return;
    }

    // Change arrow indicator based on comparison against previous generation
    set_change_arrow("#skin-calc-plus-total-ev-usd-change");
    set_change_arrow("#skin-calc-plus-total-ev-percent");
    set_change_arrow("#skin-calc-plus-total-ev-cases", false);
    set_change_arrow("#skin-calc-plus-break-even-factor");
    set_change_arrow("#skin-calc-plus-break-even-chance");
    set_change_arrow("#skin-calc-plus-median-case", false);
    set_change_arrow("#skin-calc-plus-median-usd");
    set_change_arrow("#skin-calc-plus-median-percent");
    set_change_arrow("#skin-calc-plus-jackpot-usd");
    set_change_arrow("#skin-calc-plus-jackpot-factor");
    set_change_arrow("#skin-calc-plus-jackpot-chance");

    // reveal the case odds display
    reveal_info();
}


function set_change_arrow(element, greater_positive = true) {
    var cur_gen = parseFloat($(element).data("value"));
    var old_gen = parseFloat($(element + "-old").data("value"));
    var gen_arrow = $(element + "-change");

    if (greater_positive) {
        if (cur_gen > old_gen) {
            gen_arrow.addClass("skin-calc-plus-prev-gen-change-positive");
        }
        if (cur_gen < old_gen) {
            gen_arrow.addClass("skin-calc-plus-prev-gen-change-negative");
        }
    } else {
        if (cur_gen > old_gen) {
            gen_arrow.addClass("skin-calc-plus-prev-gen-change-negative");
        }
        if (cur_gen < old_gen) {
            gen_arrow.addClass("skin-calc-plus-prev-gen-change-positive");
        }
    }
}