window.scplus2 = window.scplus2 || {};

let scplus2_show_battle_stats = false;


scplus2.generate_battles = async function() {
    if (!$(scplus2.selectors.battle_slots)) {
        alert(".battle-slots not found despite being found earlier");
        return;
    }

    // don't do anything to finished cases
    //if ($(".battle-state-finished").length) {
        //return;
    //}

    const url_cache = $(location).attr("href").toString();
    const battle_prefix = `${scplus2.prefix}-b8926`;
    const crazy = $(scplus2.selectors.crazy_mode).length ? true : false;
    const player_count = $(scplus2.selectors.battle_slot).length;
    const gamemode = $(scplus2.selectors.is_teams).length
        ? "team"
        : $(scplus2.selectors.is_sharing).length
            ? "sharing"
            : "default";
    
    $(scplus2.selectors.battle_roulette).append(`
        <button id="${battle_prefix}-toggle-stats">
            <span>SHOW STATS</span>
            <span>HIDE STATS</span>
        </button>
    `);

    $(`#${battle_prefix}-toggle-stats`).on("click", function () {
        toggle_battle_stats();
    });

    $(scplus2.selectors.battle_slot).append(`<span class="${battle_prefix}-personal-usd"></span>`);

    switch (gamemode) {
        case "team":
            $(scplus2.selectors.team_ct).append(`
                <span class="${battle_prefix}-team-usd ${battle_prefix}-ct">$99.99</span>
            `);
            $(scplus2.selectors.team_t).append(`
                <span class="${battle_prefix}-team-usd ${battle_prefix}-t">$99.99</span>
            `);
            break;

        case "sharing":
            $(scplus2.selectors.battle_slots).before(`
                <div class="${battle_prefix}-sharing-cont">
                    <span style="margin-left: 6px; margin-right: 4px;">TOTAL: </span>
                    <span style="color: #4af1cc;" class="${battle_prefix}-sharing-total">$00.00</span>
                    <span style="margin-left: 16px; margin-right: 4px;">SPLIT: </span>
                    <span style="margin-right: 6px; color: #4af1cc;" class="${battle_prefix}-sharing-split">$00.00</span>
                </div>
            `);
            break;
    
        case "default":
            break;
    }
    
    toggle_battle_stats(false);
    await update();


    async function update() {
        // stop execution when user changes page
        if ($(location).attr("href").toString() !== url_cache) {
            return;
        }

        // stop execution on battles that have finished
        if ($(scplus2.selectors.battle_finished).length) {
            return;
        }

        await update_personal_usd();

        switch (gamemode) {
            case "team":
                await update_team_content("ct");
                await update_team_content("t");
                await update_team_color();
                break;
    
            case "sharing":
                await update_sharing_content();
                break;
        
            case "default":
                break;
        }

        await new Promise(resolve => setTimeout(resolve, 250));
        update();
    }


    function toggle_battle_stats(update_toggle = true) {
        if (update_toggle) {
            scplus2_show_battle_stats = !scplus2_show_battle_stats;
        }

        if (scplus2_show_battle_stats) {
            $(`#${battle_prefix}-toggle-stats`).removeClass(`${battle_prefix}-hidden`);
            $(`.${battle_prefix}-personal-usd`).removeClass(`${battle_prefix}-hidden`);
            $(`.${battle_prefix}-team-usd`).removeClass(`${battle_prefix}-hidden`);
            $(`.${battle_prefix}-sharing-cont`).removeClass(`${battle_prefix}-hidden`);
        } else {
            $(`#${battle_prefix}-toggle-stats`).addClass(`${battle_prefix}-hidden`);
            $(`.${battle_prefix}-personal-usd`).addClass(`${battle_prefix}-hidden`);
            $(`.${battle_prefix}-team-usd`).addClass(`${battle_prefix}-hidden`);
            $(`.${battle_prefix}-sharing-cont`).addClass(`${battle_prefix}-hidden`);
        }
    }


    async function update_team_color() {
        let min_val = Infinity;
        let max_val = 0.0;

        $(`.${battle_prefix}-team-usd`).each(function () {
            min_val = Math.min(min_val, $(this).data("usd"));
            max_val = Math.max(max_val, $(this).data("usd"));
        });

        $(`.${battle_prefix}-team-usd`).each(function () {
            $(this).css("color", scplus2.get_hex_col_from_range(
                crazy ? max_val : min_val,
                (min_val + max_val) / 2,
                crazy ? min_val : max_val,
                $(this).data("usd")
            ));
        });
    }


    async function update_team_content(team) {
        const team_total = $(`.${battle_prefix}-${team}`);

        let team_usd = 0.0;
        $(`.${battle_prefix}-personal-usd`).each(function () {
            team_usd += $(this).data("team") === team ? parseFloat($(this).data("usd")) : 0.0;
        });
        team_usd = team_usd.toFixed(2);

        if (team_total.data("usd") === team_usd) {
            return;
        }

        team_total.text(`$${team_usd}`);
        team_total.data("usd", team_usd);
    }


    async function update_sharing_content() {
        const sharing_total = $(`.${battle_prefix}-sharing-total`);
        const sharing_split = $(`.${battle_prefix}-sharing-split`);

        let sharing_usd = 0.0;
        $(`.${battle_prefix}-personal-usd`).each(function () {
            sharing_usd += parseFloat($(this).data("usd"));
        });
        sharing_usd = sharing_usd.toFixed(2);

        if (sharing_total.data("usd") === sharing_usd) {
            return;
        }

        sharing_total.text(`$${sharing_usd}`);
        sharing_total.data("usd", sharing_usd);

        sharing_usd = (sharing_usd / player_count).toFixed(2);
        if (sharing_split.data("usd") === sharing_usd) {
            return;
        }

        sharing_split.text(`$${sharing_usd}`);
        sharing_split.data("usd", sharing_usd);

        if (sharing_usd >= parseFloat($(".info-panel__value .currency-text").text())) {
            $(`.${battle_prefix}-sharing-cont`).addClass(`${battle_prefix}-positive`);
        }
    }


    async function update_personal_usd() {
        let min_val = Infinity;
        let max_val = 0.0;

        $(scplus2.selectors.battle_slot).each(function() {
            const items = $(this).find(".drop-main-info__price");
            const personal_usd = $(this).find(`.${battle_prefix}-personal-usd`);
            const is_t = $(this).find("div.battle-slot-player.is-t-team").length;
            const is_ct = $(this).find("div.battle-slot-player.is-ct-team").length;

            // if the number of items are the same then don't recalculate the price
            if (personal_usd.data("item-count") === items.length) {
                return;
            }

            let new_usd = 0.0;
            items.each(function() {
                new_usd += parseFloat($(this).find(".currency-text").text());
            });
            new_usd = new_usd.toFixed(2);
            personal_usd.text(`$${new_usd}`);
            personal_usd.data("item-count", items.length);
            personal_usd.data("usd", new_usd);
            personal_usd.data("team", is_t ? "t" : is_ct ? "ct" : null);
            
            min_val = Math.min(min_val, new_usd);
            max_val = Math.max(max_val, new_usd);
        });

        $(`.${battle_prefix}-personal-usd`).each(function() {
            $(this).css("color", scplus2.get_hex_col_from_range(
                crazy ? max_val : min_val,
                (min_val + max_val) / 2,
                crazy ? min_val : max_val,
                $(this).data("usd")
            ));
        });
    }
}