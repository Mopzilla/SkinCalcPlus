window.scplus2 = window.scplus2 || {};


scplus2.generate_case_page = async function() {
    const url = $(location).attr("href").toString();
    const selector = "div.roulette-wrapper div.roulette div.roulette-cases div.roulette-case";

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
        case_json = await $.getJSON("https://gate.skin.club/apiv2/cases/" + case_name);
        case_json = case_json.data;
        cur_case_price = parseFloat(Number(case_json.price) / 100);
        odds_json = case_json.last_successful_generation.contents;
    } catch (err) {
        alert(`failed to get api data for "` + case_name + `"`);
        return;
    }

    let prev_odds_json, prev_case_price;
    try {
        prev_odds_json = await $.getJSON("https://gate.skin.club/apiv2/odds?page=2&per_page=1&sort_by=-id&filter[case_name]=" + case_name);
        prev_odds_json = prev_odds_json.data[0];

        if (prev_odds_json.length == 0) throw new Error("no previous odds");

        prev_case_price = parseFloat(Number(prev_odds_json.case_price) / 100);
        prev_odds_json = await $.getJSON("https://gate.skin.club/apiv2/odds/" + prev_odds_json.uid.toString() + "/contents");
        prev_odds_json = prev_odds_json.data;
    } catch (err) {
        prev_odds_json = null;
    }
    
    const odds_v = generate_odds_values_as_json(odds_json, cur_case_price);
    const prev_odds_v = generate_odds_values_as_json(prev_odds_json, prev_case_price);

    const case_prefix = scplus2.prefix + "-c827";
    const element_to_append = $(`
<div id="${case_prefix}-info"><div id="${case_prefix}-child">


<div id="${case_prefix}-gen-cont" ${prev_odds_v ? '' : 'style="display: none !important;"'}>
    <label id="${case_prefix}-gen-header">
        <h5 id="${case_prefix}-prev-gen">PREVIOUS ODDS</h5>
        <h5 id="${case_prefix}-cur-gen" class="${case_prefix}-active-gen">CURRENT ODDS</h5>
        <input type="checkbox" id="${case_prefix}-gen-checkbox">
    </label>
</div>

<div class="${case_prefix}-row">
    <h5>EXPECTED VALUE:</h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${Math.ceil(1 / odds_v.rarest_item_chance)}</span>
            <span>${prev_odds_v ? Math.ceil(1 / prev_odds_v.rarest_item_chance) : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">AVG. CASES</span>
        <span class="${case_prefix}-change ${calc_arrow(1 / prev_odds_v.rarest_item_chance, 1 / odds_v.rarest_item_chance)}"></span>
    </h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${"$" + odds_v.total_ev.toFixed(2)}</span>
            <span>${prev_odds_v ? "$" + prev_odds_v.total_ev.toFixed(2) : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">TOTAL EV</span>
        <span class="${case_prefix}-change ${calc_arrow(odds_v.total_ev, prev_odds_v.total_ev)}"></span>
    </h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${((odds_v.total_ev / cur_case_price) * 100).toFixed(2) + "%"}</span>
            <span>${prev_odds_v ? ((prev_odds_v.total_ev / prev_case_price) * 100).toFixed(2) + "%" : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">AS PERCENT</span>
        <span class="${case_prefix}-change ${calc_arrow(odds_v.total_ev / cur_case_price, prev_odds_v.total_ev / prev_case_price)}"></span>
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
        <span class="${case_prefix}-change ${calc_arrow(prev_case_price, cur_case_price)}"></span>
    </h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${"$" + odds_v.median_usd.toFixed(2)}</span>
            <span>${prev_odds_v ? "$" + prev_odds_v.median_usd.toFixed(2) : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">&#x2248;50%</span>
        <span class="${case_prefix}-change ${calc_arrow(odds_v.median_usd, prev_odds_v.median_usd)}"></span>
    </h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${((odds_v.median_usd / cur_case_price) * 100).toFixed(2) + "%"}</span>
            <span>${prev_odds_v ? ((prev_odds_v.median_usd / prev_case_price) * 100).toFixed(2) + "%" : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">AS PERCENT</span>
        <span class="${case_prefix}-change ${calc_arrow(odds_v.median_usd / cur_case_price, prev_odds_v.median_usd / prev_case_price)}"></span>
    </h5>
</div>

<div class="${case_prefix}-row">
    <h5>BREAK EVEN ODDS:</h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${((odds_v.break_even_factor / odds_v.break_even_chance) / cur_case_price).toFixed(2) + "x"}</span>
            <span>${prev_odds_v ? ((prev_odds_v.break_even_factor / prev_odds_v.break_even_chance) / prev_case_price).toFixed(2) + "x" : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">PROFIT FACTOR</span>
        <span class="${case_prefix}-change ${calc_arrow((odds_v.break_even_factor / odds_v.break_even_chance) / cur_case_price, (prev_odds_v.break_even_factor / prev_odds_v.break_even_chance) / prev_case_price)}"></span>
    </h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${(odds_v.break_even_chance * 100).toFixed(2) + "%"}</span>
            <span>${prev_odds_v ? (prev_odds_v.break_even_chance * 100).toFixed(2) + "%" : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">CHANCE</span>
        <span class="${case_prefix}-change ${calc_arrow(odds_v.break_even_chance, prev_odds_v.break_even_chance)}"></span>
    </h5>
</div>

<div class="${case_prefix}-row">
    <h5>JACKPOT:</h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${"$" + (odds_v.exclusive_usd / odds_v.exclusive_chance).toFixed(2)}</span>
            <span>${prev_odds_v ? "$" + (prev_odds_v.exclusive_usd / prev_odds_v.exclusive_chance).toFixed(2) : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">JACKPOT EV</span>
        <span class="${case_prefix}-change ${calc_arrow(odds_v.exclusive_usd / odds_v.exclusive_chance, prev_odds_v.exclusive_usd / prev_odds_v.exclusive_chance)}"></span>
    </h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${((odds_v.exclusive_usd / odds_v.exclusive_chance) / cur_case_price).toFixed(2) + "x"}</span>
            <span>${prev_odds_v ? ((prev_odds_v.exclusive_usd / prev_odds_v.exclusive_chance) / prev_case_price).toFixed(2) + "x" : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">PROFIT FACTOR</span>
        <span class="${case_prefix}-change ${calc_arrow((odds_v.exclusive_usd / odds_v.exclusive_chance) / cur_case_price, (prev_odds_v.exclusive_usd / prev_odds_v.exclusive_chance) / prev_case_price)}"></span>
    </h5>
    <h5>
        <span class="${case_prefix}-cell-value">
            <span>${(odds_v.exclusive_chance * 100).toFixed(2) + "%"}</span>
            <span>${prev_odds_v ? (prev_odds_v.exclusive_chance * 100).toFixed(2) + "%" : "?"}</span>
        </span>
        <span class="${case_prefix}-cell-title">CHANCE</span>
        <span class="${case_prefix}-change ${calc_arrow(odds_v.exclusive_chance, prev_odds_v.exclusive_chance)}"></span>
    </h5>
</div>

<p>ODDS UPDATED ? AGO</p>


</div></div>
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

    function calc_arrow(p, n) {
        if (p == null || n == null) {
            return "";
        }

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