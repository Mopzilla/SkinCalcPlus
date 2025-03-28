window.scplus2 = window.scplus2 || {};


scplus2.generate_battles = async function() {
    if (!$(".battle-slots")) {
        alert(".battle-slots not found despite being found earlier");
        return;
    }

    // don't do anything to finished cases
    if ($(".battle-state-finished").length) {
        //return;
    }

    const url_cache = $(location).attr("href").toString();
    const battle_prefix = `${scplus2.prefix}-b8926`;
    const crazy = $(".crazy-mode").length ? true : false;
    const player_count = $(".battle-slot").length;
    const gamemode = $(".battle-teams").length
        ? "team"
        : $(".is-sharing-mode").length
            ? "sharing"
            : "default";
    
    $(".battle-slot").append(`<span class="${battle_prefix}-personal-usd"></span>`);
    switch (gamemode) {
        case "team":
            break;

        case "sharing":
            $(".battle-slots").before(`
                <div class="${battle_prefix}-sharing-cont">
                    <span style="margin-left: 6px; margin-right: 4px;">TOTAL: </span>
                    <span style="color: #4af1cc;" class="${battle_prefix}-sharing-total">$00.00</span>
                    <span style="margin-left: 16px; margin-right: 4px;">YOUR SHARE: </span>
                    <span style="margin-right: 6px; color: #4af1cc;" class="${battle_prefix}-sharing-split">$00.00</span>
                </div>
            `);
            break;
    
        case "default":
            break;
    }

    // create gamemode specific elements:
        // sharing mode = total USD
        // 2v2 mode = team totals
    
    // add button to toggle scplus2 features for battle page, default to off
    await update();


    async function update() {
        // stop execution when user changes page
        if ($(location).attr("href").toString() !== url_cache) {
            return;
        }

        // stop execution on battles that have finished
        if ($(".battle-state-finished").length) {
            return;
        }

        await update_personal_usd();
        // set personal_usd color based on gamemode and ranking ()

        switch (gamemode) {
            case "team":
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
        $(".battle-slot").each(function() {
            const items = $(this).find(".drop-main-info__price");
            const personal_usd = $(this).find(`.${battle_prefix}-personal-usd`);

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
        });
    }
}