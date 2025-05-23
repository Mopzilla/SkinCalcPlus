window.scplus2 = window.scplus2 || {};


scplus2.generate_case_page = async function() {
    const url = $(location).attr("href").toString();
    const selector = `div.roulette-wrapper div.roulette div.roulette-cases div.roulette-case`;

    if (!url.includes("/cases/")) {
        alert(".roulette-case found on a non-case page");
        return;
    }

    if (!$(selector).length) {
        alert(".roulette-case not found despite being found earlier");
        return
    }

    const case_name = url.split("/").pop();
    let case_json, cur_case_price, odds_json;
    try {
        case_json = await $.getJSON(`https://gate.skin.club/apiv2/cases/${case_name}`);
        case_json = case_json.data;
        cur_case_price = parseFloat(Number(case_json.price) / 100);
        odds_json = case_json.last_successful_generation.contents;
    } catch (err) {
        alert(`failed to get api data for "` + case_name + `"`);
        return;
    }

    let prev_odds_json, prev_case_price;
    try {
        prev_odds_json = await $.getJSON(`
                https://gate.skin.club/apiv2/odds?page=2&per_page=1&sort_by=-id
                &filter[case_name]=${case_name}
        `);
        prev_odds_json = prev_odds_json.data[0];

        if (prev_odds_json.length == 0) throw new Error("no previous odds");

        prev_case_price = parseFloat(Number(prev_odds_json.case_price) / 100);
        prev_odds_json = await $.getJSON(`https://gate.skin.club/apiv2/odds/${prev_odds_json.uid}/contents`);
        prev_odds_json = prev_odds_json.data;
    } catch (err) {
        prev_odds_json = null;
    }
    
    const odds_v = generate_odds_values_as_json(odds_json, cur_case_price);
    const prev_odds_v = generate_odds_values_as_json(prev_odds_json, prev_case_price);

    const case_prefix = scplus2.prefix + "-c827";
    const element_to_append = $(`
<div id="${case_prefix}-info">
    <div id="${case_prefix}-child">
        <div id="${case_prefix}-gen-cont"${prev_odds_v ? '' : 'style="display: none !important;"'}>
            <label id="${case_prefix}-gen-header">
                <h5 id="${case_prefix}-prev-gen">PREVIOUS ODDS</h5>
                <h5 id="${case_prefix}-cur-gen" class="${case_prefix}-active-gen">CURRENT ODDS</h5>
                <input type="checkbox" id="${case_prefix}-gen-checkbox">
            </label>
        </div>

        <div class="${case_prefix}-row">
            <h5>EXPECTED VALUE:</h5>
            <h5>
                <span title=
"The approximate number of cases you need to open to hit the rarest item in the case.

Reaching the expected value relies upon hitting the rarest item." 
                class="${case_prefix}-cell-value">
                    <span>&asymp;${Math.ceil(1 / odds_v.rarest_item_chance)}</span>
                    <span>&asymp;${prev_odds_v ? Math.ceil(1 / prev_odds_v.rarest_item_chance) : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">AVG. CASES</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        1 / prev_odds_v.rarest_item_chance,
                        1 / odds_v.rarest_item_chance
                ) : ''}"></span>
            </h5>
            <h5>
                <span title=
"The expected value of the case.

This is calculated by taking the value of each outcome and multiplying it by the probability of it occuring."
                class="${case_prefix}-cell-value">
                    <span>${"$" + odds_v.total_ev.toFixed(2)}</span>
                    <span>${prev_odds_v ? "$" + prev_odds_v.total_ev.toFixed(2) : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">TOTAL EV</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        odds_v.total_ev,
                        prev_odds_v.total_ev
                ) : ''}"></span>
            </h5>
            <h5>
                <span title=
"The expected value as a percentage against the price of the case.

This value is almost always 90%, with some outliers. If a case has a value greater than 90% it will show as green, and worse than 90% shows as red."
                class="${case_prefix}-cell-value">
                    <span style="color: ${scplus2.get_hex_col_from_range(
                            89.5,
                            90,
                            90.5,
                            ((odds_v.total_ev / cur_case_price) * 100).toFixed(4)
                    )};">
                        ${((odds_v.total_ev / cur_case_price) * 100).toFixed(2) + "%"}
                    </span>
                    <span>${prev_odds_v ? ((
                            prev_odds_v.total_ev / prev_case_price
                    ) * 100).toFixed(2) + "%" : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">AS PERCENT</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        odds_v.total_ev / cur_case_price,
                        prev_odds_v.total_ev / prev_case_price
                ) : ''}"></span>
            </h5>
        </div>

        <div class="${case_prefix}-row">
            <h5>MEDIAN RETURN:</h5>
            <h5>
                <span class="${case_prefix}-cell-value">
                    <span>${"$" + cur_case_price.toFixed(2)}</span>
                    <span>${prev_odds_v ? "$" + prev_case_price.toFixed(2) : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">CASE PRICE</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        prev_case_price,
                        cur_case_price
                ) : ''}"></span>
            </h5>
            <h5>
                <span title=
"The median return is the value you can expect to receive for half of your openings. Half of the time you will hit below this value, and half the time hit above it.

This is calculated by adding up the percent chances of items from lowest value to highest value until the percent hits 50%, then the item that caused it to hit 50% is used as the median return."
                class="${case_prefix}-cell-value">
                    <span>${"$" + odds_v.median_usd.toFixed(2)}</span>
                    <span>${prev_odds_v ? "$" + prev_odds_v.median_usd.toFixed(2) : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">&#x2248;50%</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        odds_v.median_usd,
                        prev_odds_v.median_usd
                ) : ''}"></span>
            </h5>
            <h5>
                <span title=
"The median return represented as a percentage against the price of the case.

This value ranges massively, I have seen some as low as 1% and some as high as 85%. Higher values are better, but typically high median return cases will have other shortcomings such as low EV or small jackpots."
                class="${case_prefix}-cell-value">
                    <span>${((odds_v.median_usd / cur_case_price) * 100).toFixed(2) + "%"}</span>
                    <span>${prev_odds_v ? ((
                            prev_odds_v.median_usd / prev_case_price
                    ) * 100).toFixed(2) + "%" : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">AS PERCENT</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        odds_v.median_usd / cur_case_price,
                        prev_odds_v.median_usd / prev_case_price
                ) : ''}"></span>
            </h5>
        </div>

        <div class="${case_prefix}-row">
            <h5>BREAK EVEN ODDS:</h5>
            <h5>
                <span title=
"The break even return as a factor against the price of the case.

For example a break even chance of 20% and a profit factor of 2x means you break even on average 20% of the time, and you are expected to gain 2x the price of the case."
                class="${case_prefix}-cell-value">
                    <span>${((
                            odds_v.break_even_factor / odds_v.break_even_chance
                    ) / cur_case_price).toFixed(2) + "x"}</span>
                    <span>${prev_odds_v ? ((
                            prev_odds_v.break_even_factor / prev_odds_v.break_even_chance
                    ) / prev_case_price).toFixed(2) + "x" : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">PROFIT FACTOR</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        (odds_v.break_even_factor / odds_v.break_even_chance) / cur_case_price,
                        (prev_odds_v.break_even_factor / prev_odds_v.break_even_chance) / prev_case_price
                ) : ''}"></span>
            </h5>
            <h5>
                <span title=
"The percent chance to break even.

This is calculated by adding up all the percent chances for items whose value is greater than that of the case price."
                class="${case_prefix}-cell-value">
                    <span>${(odds_v.break_even_chance * 100).toFixed(2) + "%"}</span>
                    <span>${prev_odds_v ? (prev_odds_v.break_even_chance * 100).toFixed(2) + "%" : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">CHANCE</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        odds_v.break_even_chance,
                        prev_odds_v.break_even_chance
                ) : ''}"></span>
            </h5>
        </div>

        <div class="${case_prefix}-row">
            <h5>JACKPOT:</h5>
            <h5>
                <span title=
"The expected value of the jackpot, which is either the items that constitute for an exclusive drop or the top item if there are no exclusives. (which is rare)

This is calculated the same as the total EV, except it only takes into account the jackpot."
                class="${case_prefix}-cell-value">
                    <span>${"$" + (odds_v.exclusive_usd / odds_v.exclusive_chance).toFixed(2)}</span>
                    <span>${prev_odds_v ? "$" + (
                            prev_odds_v.exclusive_usd / prev_odds_v.exclusive_chance
                    ).toFixed(2) : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">JACKPOT EV</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        odds_v.exclusive_usd / odds_v.exclusive_chance,
                        prev_odds_v.exclusive_usd / prev_odds_v.exclusive_chance
                ) : ''}"></span>
            </h5>
            <h5>
                <span title=
"The expected value of the jackpot as a profit factor against the cost of the case."
                class="${case_prefix}-cell-value">
                    <span>${((
                            odds_v.exclusive_usd / odds_v.exclusive_chance
                    ) / cur_case_price).toFixed(2) + "x"}</span>
                    <span>${prev_odds_v ? ((
                            prev_odds_v.exclusive_usd / prev_odds_v.exclusive_chance
                    ) / prev_case_price).toFixed(2) + "x" : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">PROFIT FACTOR</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        (odds_v.exclusive_usd / odds_v.exclusive_chance) / cur_case_price,
                        (prev_odds_v.exclusive_usd / prev_odds_v.exclusive_chance) / prev_case_price
                ) : ''}"></span>
            </h5>
            <h5>
                <span title=
"The chance of hitting a jackpot in this case. A jackpot is any item that is in the exclusive drop pool, or the top item in the case if no exclusives exist. (which is rare)

This is calculated by just adding the percent chances of each exclusive drop together."
                class="${case_prefix}-cell-value">
                    <span>${(odds_v.exclusive_chance * 100).toFixed(2) + "%"}</span>
                    <span>${prev_odds_v ? (prev_odds_v.exclusive_chance * 100).toFixed(2) + "%" : "?"}</span>
                </span>
                <span class="${case_prefix}-cell-title">CHANCE</span>
                <span class="${case_prefix}-change ${prev_odds_v ? calc_arrow(
                        odds_v.exclusive_chance,
                        prev_odds_v.exclusive_chance
                ) : ''}"></span>
            </h5>
        </div>

        <p>${time_since(case_json.last_successful_generation.created_at)}</p>
    </div>
</div>
    `);
    $(selector).first().append(element_to_append);

    $(`#${case_prefix}-info`).css("opacity", "1.0");

    $(`#${case_prefix}-gen-checkbox`).on("change", function() {
        if ($(this).is(`:checked`)) {
            // toggle values
            $(`#${case_prefix}-child`)
                .addClass(`${case_prefix}-show-prev-gen`);
    
            // change highlighted text
            $(`#${case_prefix}-prev-gen`)
                .addClass(`${case_prefix}-active-gen`);
            $(`#${case_prefix}-cur-gen`)
                .removeClass(`${case_prefix}-active-gen`);
        } else {
            // toggle values
            $(`#${case_prefix}-child`)
                .removeClass(`${case_prefix}-show-prev-gen`);
    
            // change highlighted text
            $(`#${case_prefix}-prev-gen`)
                .removeClass(`${case_prefix}-active-gen`);
            $(`#${case_prefix}-cur-gen`)
                .addClass(`${case_prefix}-active-gen`);
        }
    });


    function time_since(api_time) {
        const now = new Date();
        const past = new Date(api_time);
        const diff_in_seconds = Math.floor((now - past) / 1000);

        const intervals = [
            { label: "YEAR", seconds: 31536000, over_text: true },
            { label: "MONTH", seconds: 2592000 },
            { label: "WEEK", seconds: 604800 },
            { label: "DAY", seconds: 86400 },
            { label: "HOUR", seconds: 3600 },
            { label: "MINUTE", seconds: 60 },
            { label: "SECOND", seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(diff_in_seconds / interval.seconds);
            if (count >= 1) {
                return `ODDS UPDATED
                ${interval.over_text ? "OVER " : ""}${count}
                ${interval.label}${count > 1 ? "S" : ""} AGO`
            }
        }
    }


    function calc_arrow(p, n) {
        return p > n
            ? `${case_prefix}-change-positive` 
            : p < n 
                ? `${case_prefix}-change-negative` 
                : "";
    }


    function generate_odds_values_as_json(items, case_price) {
        if (items == null) {
            return null;
        }

        let final_data = {}
        final_data.total_ev = 0.0;
        final_data.rarest_item_chance = 1.0;
        final_data.median_usd = 0.0;
        final_data.median_item_chance = 1.0;
        final_data.break_even_factor = 0.0;
        final_data.break_even_chance = 0.0;
        final_data.exclusive_usd = 0.0;
        final_data.exclusive_chance = 0.0;
        final_data.jackpot_usd = 0.0;
        final_data.jackpot_chance = 0.0;

        // sort items: lowest price -> highest price
        items.sort((a, b) => a.fixed_price - b.fixed_price);
        for (key in items) {
            var item = items[key];
            var item_price = parseFloat(Number(item.fixed_price) / 100);
            var item_chance = parseFloat(Number(item.chance_percent) / 100);

            if (item_price >= case_price) {
                final_data.break_even_chance += item_chance;
                final_data.break_even_factor += item_price * item_chance;
            }
            
            if (item_chance < final_data.rarest_item_chance) {
                final_data.rarest_item_chance = item_chance;
            }

            final_data.median_item_chance -= item_chance;
            if (final_data.median_item_chance <= 0.5 && !final_data.median_usd) {
                final_data.median_usd = item_price;
            }

            // to calculate jackpot values
            if (item.is_exclusive) {
                final_data.exclusive_usd += item_price * item_chance;
                final_data.exclusive_chance += item_chance;
            }

            // in case there are no exclusive items, we use the best item
            if (item_price > final_data.jackpot_usd) {
                final_data.jackpot_usd = item_price * item_chance;
                final_data.jackpot_chance = item_chance;
            }

            final_data.total_ev += item_price * item_chance;
        }

        // no exclusive drop, use best item instead
        if (!final_data.exclusive_chance) {
            final_data.exclusive_usd = final_data.jackpot_usd;
            final_data.exclusive_chance = final_data.jackpot_chance;
        }

        return final_data;
    }
}