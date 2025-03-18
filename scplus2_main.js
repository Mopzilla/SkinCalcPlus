window.scplus2 = window.scplus2 || {};


scplus2.prefix = "scplus2";


scplus2.observer = new MutationObserver(() => {
    if(!scplus2.is_null_or_set_pending("div.roulette-wrapper div.roulette div.roulette-cases")) {
        scplus2.generate_case_page();
    }
});


scplus2.is_null_or_set_pending = function(selector) {
    const pending_class = scplus2.prefix + "-pending";

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


scplus2.get_wear_shorthand = function(wear) {
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


scplus2.observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: false,
    characterData: false,
});