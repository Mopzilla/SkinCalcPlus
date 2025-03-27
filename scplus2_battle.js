window.scplus2 = window.scplus2 || {};


scplus2.generate_battles = async function() {
    if (!$(".battle-slots")) {
        alert(".battle-slots not found despite being found earlier");
        return;
    }

    const battle_prefix = `${scplus2.prefix}-b8926`

    $(".battle-slot").append(`<span class="${battle_prefix}-personal-usd"></span>`);

    await set_personal_usd();

    async function set_personal_usd() {
        if ($(".battle-state-finished").length) {
            return;
        }

        // for each battle slot do:
            // if price length == cache length (as data on span):
                // return
            // let new_usd
            // for each price do:
                // format price and add to new_usd
            // set span text to new usd and span data to new length

        await new Promise(resolve => setTimeout(resolve, 250));
    }
}