window.scplus2 = window.scplus2 || {};


scplus2.prefix = "scplus2";


scplus2.observer = new MutationObserver(() => {
    if (!scplus2.is_null_or_set_pending("div.roulette-wrapper div.roulette div.roulette-cases")) {
        scplus2.generate_case_page();
    }

    if ($("div.giveaway-case").length) {
        if (!scplus2.is_null_or_set_pending("div.container.sm.skins-list")) {
            scplus2.generate_giveaway_page();
        }
    }

    if (!scplus2.is_null_or_set_pending(".header-block-wrapper .sticky-profile .user-block")) {
        scplus2.generate_header();
    }

    if (!scplus2.is_null_or_set_pending(".battle-slots")) {
        scplus2.generate_battles();
    }

    if (!scplus2.is_null_or_set_pending(".user-level .user-level__xp-info")) {
        scplus2.generate_profile();
    }
});


scplus2.is_null_or_set_pending = function(selector) {
    const pending_class = `${scplus2.prefix}-pending`;

    if(!$(selector).length) {
        // element doesn't exist
        return true;
    }

    if ($(selector).length > 1) {
        // too many elements matched, refine selector
        alert("more than one element matches the filter of: " + selector.toString());
        $(selector).addClass(pending_class);
        return true;
    }
    
    if ($(selector).hasClass(pending_class)) {
        // element already pending
        return true;
    }

    // element exists and isn't already pending
    $(selector).addClass(pending_class);
    return false;
}


scplus2.observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: false,
    characterData: false,
});


scplus2.get_hex_col_from_range = function(min, avg, max, val) {
    var color_range = [
        "#FA3671",      // 0%
        "#FB6895",      // 12.5%
        "#FD9BB8",      // 25%
        "#FECDDC",      // 37.5%
        "#FFFFFF",      // 50%
        "#C9F1E5",      // 62.5%
        "#93E4CB",      // 75%
        "#5CD6B1",      // 87.5%
        "#26C897",      // 100%
    ];

    var val_normalized = 0.5 + ((val - avg) / (2 * (max - min)));
    var col_index = Math.round(val_normalized * (color_range.length - 1));

    return color_range[col_index];
}