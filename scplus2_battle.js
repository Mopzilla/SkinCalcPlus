window.scplus2 = window.scplus2 || {};


scplus2.generate_battles = async function() {
    if (!$(".battle-slots")) {
        alert(".battle-slots not found despite being found earlier");
        return;
    }

    // don't do anything to finished cases
    if ($(".battle-state-finished").length) {
        return;
    }

    const battle_prefix = `${scplus2.prefix}-b8926`
    $(".battle-slot").append(`<span class="${battle_prefix}-personal-usd"></span>`);
    // create gamemode specific elements:
        // sharing mode = total USD
        // 2v2 mode = team totals
    
    // add button to toggle scplus2 features for battle page, default to off
    await update();


    async function update() {
        await set_personal_usd();
        // set personal_usd color based on gamemode and ranking ()
        // update gamemode specific elements

        await new Promise(resolve => setTimeout(resolve, 250));
        update();
    }


    async function set_personal_usd() {
        if ($(".battle-state-finished").length) {
            return;
        }
    
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
        });
    }
}